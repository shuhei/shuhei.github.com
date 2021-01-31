---
layout: post
title: "Speed up your RSpec tests by reviewing Factory Girl"
date: 2015-09-26
comments: true
tags: [Ruby,Rails]
---

[Factory Girl](https://github.com/thoughtbot/factory_girl) is a great tool that makes test data creation easier. However, if you don't use it properly, it may imperceptibly slow down your tests.

In this post, I will walk through some caveats that I stumbled upon in my current project. They could be applied not only to RSpec but I will use RSpec as an example.

## Measure! Measure! Measure!

>What gets measured gets managed.
>
><cite>Peter Drucker</cite>

First of all, we want to know which tests take most of the times. RSpec has `--profile`/`-p` option for the very purpose.

```sh
$ rspec --help
# ...
    -p, --[no-]profile [COUNT]       Enable profiling of examples and list the slowest examples (default: 10).
# ...
```

Let's measure your tests with it.

```sh
# Run all specs with profiling.
bin/rspec -p

# Run specific spec file with profiling.
bin/rspec spec/models/article_spec.rb -p
```

It shows the slowest examples and groups. They should be the good point to start with.

## Database writes are slow

There are many potential causes that slow down your tests. External API calls, file access, database access and etc. Among them, I would like to focus on database writes in this post because they are ubiquitous and relatively slow.

You could use mocks/stubs to completely avoid touching database. However, you may have a certain amount of code that touches database. I believe it's better to find database-related bugs with a bit slow tests than finding them on production that were overlooked by lightning-fast tests.

One of the Rails' greatest features is that we can easily write tests that involves database queries. It's too good not to use it at all.

Before you consider parallel execution of tests that may introduce other complexity, you still have something to do.

## Sample project

Let's say we have a blog application with the following models:

```ruby
class Author < ActiveRecord::Base
  has_many :articles
end

class Article < ActiveRecord::Base
  belongs_to :author
  has_many :comments

  validates :author, presence: true
end

class Comment < ActiveRecord::Base
  belongs_to :article

  validates :article, presence: true

  def edited?
    created_at < updated_at
  end
end
```

and factories:

```ruby
FactoryGirl.define do
  factory :author do
    first_name 'Shuhei'
    last_name 'Kagawa'
  end

  factory :article do
    author
    title 'Rails on Rails'
    body 'If you created an application that manages railway rails with the Rails framework, its name would be Rails on Rails...'
  end

  factory :comment do
    article
    commenter 'Railer'
    body 'Great post!'
  end
end
```

## FactoryGirl.build creates associations

Let's review Factory Girl's `create` and `build`. [`create`](http://www.rubydoc.info/gems/factory_girl/FactoryGirl/Syntax/Methods#create-instance_method) instantiates an model saving it into the database just like `ActiveRecord::Base.create` does. [`build`](http://www.rubydoc.info/gems/factory_girl/FactoryGirl/Syntax/Methods#build-instance_method) only instantiates an model without saving it just like `ActiveRecord::Base.new` does.

The following usage of `FactoryGirl.build` seems harmless. `build` doesn't save a `Comment` into the database while `create` does, right?

```ruby
describe Comment
  describe '#edited?' do
    it 'returns true if updated after creation' do
      now = Time.zone.now
      comment = FactoryGirl.build(:comment, created_at: now - 1.minute, updated_at: now)

      expect(comment).to be_edited
    end

    it 'returns false right after creation' do
      now = Time.zone.now
      comment = FactoryGirl.build(:comment, created_at: now, updated_at: now)

      expect(comment).not_to be_edited
    end
  end
end
```

However, `build` actually saves the model's associations, `article` and `author` created by `article` in this case, into the database [unless you give `strategy: :build` option in the factory](http://www.rubydoc.info/gems/factory_girl/file/GETTING_STARTED.md#Associations). So `build` actually creates all its ancestor models, which can be a huge performance penalty if called plenty of times.

To avoid this behavior, you can use [`FactoryGirl.build_stubbed`](http://www.rubydoc.info/gems/factory_girl/FactoryGirl/Syntax/Methods#build_stubbed-instance_method) instead of `build`. It builds all associations and don't save them into the database.

```ruby
comment = FactoryGirl.build_stubbed(:comment, created_at: now - 1.minute, updated_at: now)
```

In this case, you even don't need to use Factory Girl because the `edited?` method doesn't involve associations. The following just works fine:

```ruby
comment = Comment.new(created_at: now - 1.minute, updated_at: now)
```

Here is another case where unnecessary `post` is created by `build(:comment)`.

```ruby
post = FactoryGirl.create(:post)
post.comments << FactoryGirl.build(:comment)
```

You could do:

```ruby
post = FactoryGirl.create(:post)
post.comments << FactoryGirl.build(:comment, post: nil)

# or

post = FactoryGirl.create(:post)
FactoryGirl.create(:comment, post: post)
```

## Review your association chain

There is also a case where you intentionally use `FactoryGirl.create` and create unused objects. Let's think about `Blog` model that has multiple authors and multiple posts.

```ruby
FactoryGirl.define do
  factory :blog do
  end

  factory :author do
    blog
  end

  factory :post do
    author
    blog
  end
end
```

With the setup above, `FactoryGirl.create(:post)` **creates blog twice**, once in the `post` factory and once in the `author` factory. Not only is it redundant, but also it may introduce data inconsistency because the two `blog` instances are different.

The `post` factory could reuse the `author`'s `blog`.

```ruby
factory :post do
  author
  blog { author.blog }
end
```

## Summary

To recap, there are things to consider before you stub everything or start considering parallel execution of tests. Imagine what Factory Girl exactly does and review your tests and factories. You will be able to speed up your tests for relatively cheaper cost.

## References

- [Factory Girl](https://github.com/thoughtbot/factory_girl)
- [Speed Up Tests by Selectively Avoiding Factory Girl](https://robots.thoughtbot.com/speed-up-tests-by-selectively-avoiding-factory-girl)
- [Use Factory Girl's build_stubbed for a Faster Test Suite](https://robots.thoughtbot.com/use-factory-girls-build-stubbed-for-a-faster-test)
