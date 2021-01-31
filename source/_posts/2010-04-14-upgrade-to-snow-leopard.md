---
layout: post
title: "今さら Snow Leopard にアップグレード"
published: true
date: 2010-04-14 23:57
comments: true
tags:
categories: []
---

Snow Leopard の発売から 1 年以上たっていますが、外見上はあまり変わり映えしないし、面倒なので Leopard のままやってきました。
しかし、iPhone SDK 4.0 beta は Leopard には入らないというので、ついに観念。
ヨドバシのオンラインストア（Amazon より高いけど送料無料、即日発送、ポイントつく）で注文し、アップグレードしてみました。
以下、それに伴う環境構築も合わせてメモ。

## ファイル整理

引っ越し前の大掃除ということで、いらないファイルを一掃しました。

## （iTunes の認証を解除しておく）

iTunes で購入した音楽やアプリは 5 台までのコンピュータで共有できるようです。
認証を解除しておかないと、この台数一つを無駄にすることになります。

これには気がつかず、すっかりやり損ねました！
今のところ 5 台で共有することもなさそうなので構いませんが・・・。

## MacPorts, RubyGems のメモ

```
$ port installed > ports20100414.txt
$ gem list --local > gems20100414.txt
```

## Time Machine でバックアップ

外付け HDD を引っ張りだしてきてバックアップ。
Time Machine は初めてだったので、フルバックアップで時間がかかりました。
120 GB くらいで 3 から 4 時間ほど。

## Snow Leopard インストール

Snow Leopard の DVD を入れ、ディスクユーティリティでフォーマット。
そしてインストール。

## Time Machine からデータを転送

インストールのウィザードに身を任せ、Time Machine からデータを転送。
ユーザと設定のみ転送し、&#8221;HDD 上のその他のファイル&#8220;（みたいなやつ）は転送せず。

## Xcode のインストール

DVD の &#8220;オプションインストール&#8221; フォルダから Xcode をインストール。

## ソフトウェアアップデート

言われるがままソフトウェアアップデートをし、再起動。
そしたらまた Java のアップデートがあるとかで、立て続けにソフトウェアアップデート、再起動。

## iPhone SDK のインストール

Xcode 3.2.3 + iPhone SDK 4.0 beta をインストール。

## MacPorts のインストール

Leopard には最初から入っていたような気がするんですが、Snow Leopard には入っていません。
サイトからダウンロードしてインストール。
パッケージ管理ソフトとして Fink や Homebrew なども少し検討してみましたが、結局使い慣れた MacPorts に。

## Ruby 1.9 のインストール

これを機に Ruby も 1.9 系統を使うようにしてみます。

```
$ sudo port install ruby19
```

このままだとコマンド名が `ruby1.9` や `rake1.9` です。
`ruby` や `rake` として使いたいので、シンボリックリンクを作成。

```
$ cd /opt/local/bin
$ sudo ln -s erb1.9 erb
$ sudo ln -s gem1.9 gem
$ sudo ln -s irb1.9 irb
$ sudo ln -s rake1.9 rake
$ sudo ln -s rdoc1.9 rdoc
$ sudo ln -s ri1.9 ri
$ sudo ln -s ruby1.9 ruby
$ sudo ln -s testrb1.9 testrb
$ which ruby
/opt/local/bin/ruby
```

こんなんでいいんですかね・・・？
.bashrc が `export PATH=/opt/local/bin:/opt/local/sbin:$PATH` 的な感じになっているのが前提です。

なお、Ruby 1.9 には RubyGems が同梱されているので、別途インストールは不要。

## 一旦完了

とりあえず今日のところはこの辺で一旦完了ということで。
その他の MacPorts のパッケージや RubyGems の gem は、必要に応じてインストールすることにします。
