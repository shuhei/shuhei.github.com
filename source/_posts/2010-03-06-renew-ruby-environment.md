---
layout: post
title: "Ruby の環境を新しく"
published: true
date: 2010-03-06
comments: true
tags:
categories:
---

家の Macbook と Ubuntu で Ruby 周りのバージョンを揃えた時のメモ。
以下の環境に揃えました。

- Ruby 1.8.7
- Ruby Gems 1.3.5（Macbook は 1.3.4）
- Rails 2.3.5

## Ubuntu Server 9.10 64 bit

Ruby はもともと 1.8.7。RubyGems も 1.3.5。
入っている Rails のバージョンを上げる。Aptitude で入れると古いので、RubyGems を使う事に。

```
sudo aptitude remove rails
sudo gem install rails
sudo gem install sqlite3-ruby

vi ~/.bashrc
export PATH=/var/lib/gem/1.8/bin:$PATH
```

## Mac OS X

もともと入っている Ruby が 1.8.6 なので、1.8.7 を入れます。

```
sudo port install ruby
```

RubyGems も MacPorts から。1.3.4 なのは我慢。

```
sudo port install rb-rubygems
```
