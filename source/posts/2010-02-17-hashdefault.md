---
title: "Ruby の Hash#default"
tags: [Ruby]
---

Windows XP の Ruby 1.8.7 で

```
h = {}
h.default = []
h["hello"] << "world"
```

としたとき

```
puts h.size # => 1
puts h # => {"hello"=>["world"]}
```

となるのを期待していたのですが `{}` と出力されます。
さらに、なんと以下のようになりました。

```
puts h["foo"] # => ["world"]
```

つまり、Hash のデフォルト値は一つの値を使い回しているということ。その場でコピーが作られる訳ではないようです。
