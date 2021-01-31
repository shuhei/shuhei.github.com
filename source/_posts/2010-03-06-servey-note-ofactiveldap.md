---
layout: post
title: "ActiveLdap 調査メモ"
published: true
date: 2010-03-06
comments: true
tags: []
---

未検証ですが、以下の記事から調査したことのメモ。

- [Rubyist Magazine &#8211; ActiveLdap を使ってみよう（前編）](http://jp.rubyist.net/magazine/?0027-ActiveLdap)
- [Rails で作る Active Directory と連携した社内システム](http://www.clear-code.com/archives/rails-seminar-technical-night)

## Rails と併用可

```
script/generate scaffold_active_ldap
script/generete model_active_ldap user
```

## 接続

接続はプロセス間共有不可。普通にやると、Passenger はだめ。

### 対策

- ユーザ毎の接続を持たせない。
- 1 リクエストで完結させる。

## バックエンド

- Ruby なら Ruby/LDAP（OpenLDAP のバインディング）。
- JRuby なら JNDI。
- PureRuby の Net::LDAP は、trunk でないと問題。
