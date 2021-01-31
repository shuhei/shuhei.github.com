---
layout: post
title: "Category index for Octopress"
date: 2012-04-03
tags: [Octopress]
---
サイドバーにカテゴリー一覧を出してみました。

_config.yml

```diff
diff --git a/_config.yml b/_config.yml
index 5c7d335..7ad03bb 100644
--- a/_config.yml
+++ b/_config.yml
@@ -45,7 +45,7 @@ titlecase: true       # Converts page and post titles to titlecase
 
 # list each of the sidebar modules you want to include, in the order you want them to appear.
 # To add custom asides, create files in /source/_includes/custom/asides/ and add them to the list like 'custom/asides/custom_aside_name.html'
-default_asides: [asides/recent_posts.html, asides/github.html, asides/twitter.html, asides/delicious.html, asides/pinboard.html, asides/googleplus.html]
+default_asides: [asides/recent_posts.html, custom/asides/categories.html, asides/github.html, asides/twitter.html, asides/delicious.html, asides/pinboard.
 
 # Each layout uses the default asides, but they can have their own asides instead. Simply uncomment the lines below
 # and add an array with the asides you want to use.
```

source/_includes/custom/asides/categories.html

```html
<section>
  <h1>Categories</h1>
  <ul>
    {% for category in site.categories %}
      <li>{{ category | category_link }}</li>
    {% endfor %}
  </ul>
</section>
```

2013-10-27 編集: 現在はデフォルトで `category_link` メソッドが追加されているので、以下の修正は不要です。

plugins/category_generator.rb

```diff
diff --git a/plugins/category_generator.rb b/plugins/category_generator.rb
index bb5fd32..28bf7e0 100644
--- a/plugins/category_generator.rb
+++ b/plugins/category_generator.rb
@@ -156,6 +156,18 @@ module Jekyll
       end
     end
 
+    # Outputs a link of a category.
+    # 
+    #  +category+ is an item of site.categories.
+    #
+    # Returns string
+    # 
+    def category_link(category)
+      dir = @context.registers[:site].config['category_dir']
+      category = category[0]
+      "<a class='category' href='/#{dir}/#{category.gsub(/_|\P{Word}/, '-').gsub(/-{2,}/, '-').downcase}/'>#{category}</a>"
+    end
+
     # Outputs the post.date as formatted html, with hooks for CSS styling.
     #
     #  +date+ is the date object to format as HTML.
```

Gist: [Add a category index to Octopress](https://gist.github.com/shuhei/2288181)
