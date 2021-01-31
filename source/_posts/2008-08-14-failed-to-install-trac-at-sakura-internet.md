---
layout: post
title: "さくらに Trac をインストール・・・失敗"
date: 2008-08-14
tags: [Python, UNIX/LINUX, さくらインターネット]
---

- [心は十五歳の少年漂流記 » さくらで Trac](http://seasaw.eek.jp/wordpress/?p=38)
- [Trac/さくらインターネットでインストール &#8211; Happy Engineer Life](http://wiki.cre8system.jp/index.php?Trac%2F%A4%B5%A4%AF%A4%E9%A5%A4%A5%F3%A5%BF%A1%BC%A5%CD%A5%C3%A5%C8%A4%C7%A5%A4%A5%F3%A5%B9%A5%C8%A1%BC%A5%EB)

このあたりを参考に Trac をインストールしようとしましたが、Subversion までは入ったものの、pysqlite が入らず。
build しようとすると、「error: don&#8217;t know how to complile C/C++ ～～～」みたいなエラーが出てダメ。
他の人のブログにはそんなことは書いてないので、自分で設定を変えた部分のせいなんですかね。

また今度チャレンジします。

## <ins>追記</ins>

[その後、成功しました。](/blog/2008/08/23/succeed-to-install-trac-at-sakura-internet/)
