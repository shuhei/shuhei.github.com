---
title: "Assign Time/time string in UTC to ActiveRecord date attribute"
tags: [Ruby, Rails]
---

**TL;DR: `gem 'date_timezone'` in `Gemfile` and `include DateTimezone` in ActiveRecord models if you are on the east side of the prime meridian.**

ActiveRecord is great. It automatically converts data [according to the type of database column](https://github.com/rails/rails/tree/v4.2.0/activerecord/lib/active_record/type). That's why we can throw request params, whose values are often strings, into mass assignment methods like `create` and `update` without manual conversion. The conversion works perfectly in most of the cases except for `date` attribute.

To `date` attribute, we can assign `Date` and date string like `'2015-03-02'` without any problem. However, `Time` and time string with different time zone, usualy UTC, don't work well here. Their own time zones are not taken into account when converted to `Date`.

```ruby
class Application < Rails::Application
  config.time_zone = 'Tokyo'
end

class Person < ActiveRecord::Base
  # birth_date :date
end

expect(Person.new(birth_date: '2015-03-02').birth_date).to eq(Date.new(2015, 3, 2))
expect(Person.new(birth_date: Date.new(2015, 3, 2)).birth_date).to eq(Date.new(2015, 3, 2))
expect(Person.new(birth_date: Time.zone.local(2015, 3, 2)).birth_date).to eq(Date.new(2015, 3, 2))

# But...
expect(Person.new(birth_date: Time.utc(2015, 3, 1, 15)).birth_date).to eq(Date.new(2015, 3, 1))
expect(Person.new(birth_date: '2015-03-01T15:00:00.000Z').birth_date).to eq(Date.new(2015, 3, 1))
```

There may be several cases that we have to assign `Time` or time string in different time zone to `date` attribute. My own case was a Single Page Application built with AngularJS that sends JavaScript's `Date` object to Rails API. JavaScript's `JSON.parse()` serializes `Date` into a string of ISO 8601 format in UTC time zone. This is problematic to the people on the east side of the prime meridian because they get different date when they express their beginning of date in UTC.

```javascript
JSON.stringify({ date: new Date(2015, 3 - 1, 2) });
// '{"date":"2015-03-01T15:00:00.000Z"}'
```

I could have controlled front-end code to always send date string like `'2015-03-02'` or converted the ISO 8601 string with `Time.zone.parse` in Rails controllers. But those approaches seemed error prone. I wanted to take care of it at the bottom, ActiveRecord model. I created a concern to override `date`-column mutators like the following. It converts `Time` and time string to `TimeWithZone` with the application's time zone.

```
def birth_date=(value)
  self[:birth_date] = case value
                      when String then Time.zone.parse(value)
                      when Time then value.in_time_zone
                      else value
                      end
end
```

The concern was extracted as a gem, [date_timezone](https://github.com/shuhei/date_timezone).

```Gemfile
gem 'date_timezone'
```

```ruby
class Person < ActiveRecord::Base
  include DateTimezone

  # birth_date :date
end
```

If you are creating Rails application on the east side of the prime meridian and in trouble with the same issue as mine, please try it and share what you think.
