---
layout: post
title: "gem で cairo をインストール"
published: true
date: 2009-10-12
comments: true
tags:
tags: []
---

```
sudo gem install cairo
```

でインストールできず、四苦八苦。
調べてみたところ、下記 URL に行き当たりました。
よくわかりませんが、extconf.rb 内に記述されている何かのオプションにスペースが足りなかったようです。

[[Bug 18623] New: Patch for Ruby gem cairo-1.8. 0 to build on Mac OS X Leopard](http://lists.cairographics.org/archives/cairo-bugs/2008-November/002790.html)

以下のようにパッチを当ててからビルドすると、無事成功しました。

```
cd cairo-1.8.0
sudo patch -p0 < 20081118-fix_rcairo_build_on_mac_leopard.patch
sudo ruby extconf.rb
sudo make
sudo make install
```
