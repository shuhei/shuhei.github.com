---
layout: post
title: "普通のウェブサイト制作に CoffeeScript と SCSS を使ってみて"
published: true
date: 2012-04-07 13:30
comments: true
tags: 
categories: 
---
最近バックエンドなしの普通の Web サイトを作るのに、ためしに CoffeeScript と SCSS を使ってみています。Ruby の [watchr](https://github.com/mynyml/watchr) を使って、ファイルを更新したら自動でコンパイルするように設定。

{% gist 2325038 %}

今のところ、SCSS と Compass はとても良いけど、CoffeeScript は jQuery との相性がいまいちという感想。jQuery のメソッドチェーンを書こうとすると、CoffeeScript でも関数実行の括弧が必要で JS とあまり変わらない。jQuery でちょこちょこエフェクトとかをつけるだけだと、あまりメリットがないかも。Backbone.js とかを使ってクラススタイルでごりごり書くのには良さそうなので、今度試してみたいなーと思います。

