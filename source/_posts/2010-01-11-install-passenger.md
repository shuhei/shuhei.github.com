---
layout: post
title: "Ubuntu Server に Passenger をインストール"
date: 2010-01-11
tags: []
---

## Aptitude ではだめ

とりあえずは `apt-get` と思い、下記のようにしたらとしたら `libapache2-mod-php5` などが消されて焦りました。

```sh
sudo apt-get install libapache2-mod-passenger
```

Aptitude を使うと、Passenger と PHP 5 は共存できないようです。それぞれが依存している `apache2-mpm-worker` と `apache2-mpm-prefork` が共存できないのが原因のよう。

via [Ubuntu 日本語フォーラム / ubuntu 9.04 passenger と　 php5 は共存できない？](https://forums.ubuntulinux.jp/viewtopic.php?id=5341)

## Gem でインストール

しょうがないので PHP 5 を入れ直し、Passenger を gem で入れる事にしました。

```sh
sudo gem install passenger
sudo /var/lib/gems/1.8/bin/passenger-install-apache2-module
```

足りないパッケージさあれば教えてくれるので、インストールしてから再度実行。

```sh
sudo /var/lib/gems/1.8/bin/passenger-install-apache2-module
```

## 設定ファイルの記述

`httpd.conf` には直接書かず、専用のファイルを作ります。Ubuntu の流儀？

`/etc/apache2/mods-available/passenger.load`:

```apache
LoadModule passenger_module /var/lib/gems/1.8/gems/passenger-2.2.9/ext/apache2/mod_passenger.so
```

`/etc/apache2/mods-available/passenger.conf`:

```apache
<ifModule mod_passenger.c>
  PassengerRoot /var/lib/gems/1.8/gems/passenger-2.2.9
  PassengerRuby /usr/bin/ruby1.8
</ifModule>
```

モジュールを有効に。`mods-enabled` から `mods-available` にシンボリックリンクを張って有効にするんですね。知りませんでした。

```sh
sudo ln -s /etc/apache2/mods-available/passenger.load /etc/apache2/mods-enabled/passenger.load
sudo ln -s /etc/apache2/mods-available/passenger.conf /etc/apache2/mods-enabled/passenger.conf
```

## サブディレクトリで公開

ルート以外で公開したい場合、まずは公開ディレクトリにシンボリックリンクを作成します。

```sh
sudo ln -s /path/to/app-name/public /path/to/www/app-name
```

そして、Apache の設定ファイルに少し付け足します。

`/etc/apache2/mods-available/passenger.conf`:

```apache
<ifModule mod_passenger.c>
  PassengerRoot /var/lib/gems/1.8/gems/passenger-2.2.9
  PassengerRuby /usr/bin/ruby1.8
  RailsBaseURI /app-name
</ifModule>
```

via [suz-lab - blog: Passenger で Redmine をサブディレクトリに公開](http://blog.suz-lab.com/2009/05/passengerredmine.html)
