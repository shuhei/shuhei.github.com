---
layout: post
title: "さくらに Trac をインストール・・・成功"
date: 2008-08-23
tags: [UNIX/LINUX, さくらインターネット]
---

やっと Trac 入りました。

[前回](/blog/2008/08/14/failed-to-install-trac-at-sakura-internet/) pysqlite が入らなかったのは、.pydistutils.cfg の中で、 CC=&#8220;gcc&#8221; としていたのが原因だったようです。
たぶん、以前 numpy を入れようとしていろいろいじったときの名残。
変更内容はメモしておかないといけませんね。

.pydistutils.cfg を直して、pysqlite2.4.1 をインストール。

clearsilver は最新版を試したもののダメで、 0.9.14 ならインストールできました。
あとは docutils 0.4 と Trac 0.11.1.ja1 と WebAdmin を入れて完成。

それにしても、動きがモッサリしてます。
CGI だからですかね。
うーん、自宅サーバ立てたい。
