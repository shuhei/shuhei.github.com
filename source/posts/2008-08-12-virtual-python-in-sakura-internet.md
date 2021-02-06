---
title: "さくらのサーバに virtual-python を入れる"
tags: [Python, さくらインターネット]
lang: ja
---

さくらインターネットで easy install がうまく動かなかったので、virtual-python を使って Python 環境を再構築してみました。
問題は他にあった気がしますが、easy install は使えるようになりました。

参考にしたのは、以下のサイト。

- [さくらインターネットに python を再インストール &#8211; cimada-ism](http://d.hatena.ne.jp/cimadai/20080713/1215964300)
- [ウノウラボ Unoh Labs: Python 開発環境を整えよう](http://labs.unoh.net/2007/04/python.html)

easy install が使えるようになったので、いろいろインストールしていたのですが、numpy など c のコンパイラを使うモジュールを入れようとするとエラーが出ます。c77（？）とかが入っていない、というような内容です。
これについては、必要になるまで放置。
