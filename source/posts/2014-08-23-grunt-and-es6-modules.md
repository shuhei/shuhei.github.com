---
layout: post
title: "Grunt と ES6 Modules"
tags: [JavaScript]
---

大分間が空きましたが、社内勉強会で Grunt と ES6 Modules について発表したので、このへんで書いておきます。

## [Introduction to Grunt](https://speakerdeck.com/shuhei/introduction-to-grunt)

こっちは、デザイナー向けに Grunt を紹介したときの資料。これまでよくわからず使っていた Grunt の設定ファイルについてちゃんと調べました。Qiita の[Grunt の設定オブジェクトの秘密](http://qiita.com/shuhei/items/1156a795903b55d6b0d7) にも詳しく書いてます。やっとわかったマルチタスク。

しかし、勉強会では結局何ができるか、どう運用するかの話が中心で、設定ファイルの話はしませんでした。初めての人には、細かいことよりも、まずは何ができるかですよね。良い経験になりました。

<script async class="speakerdeck-embed" data-id="39e78f00fade0131d88d6a0d18b48761" data-ratio="1.33333333333333" src="//speakerdeck.com/assets/embed.js"></script>

## [Start ES6 Today](https://speakerdeck.com/shuhei/start-es6-modules-today)

こっちは、あまりちゃんと調べられてなくて中途半端です。

結論としては、ES6 Modules はまだ早い。[System.js](https://github.com/systemjs/systemjs) とか使えば今でも使えそうだけど、それなら Browerify でいいかなというのが今の気分です。むしろ、class とか ES6 の他の文法を使いたい。Traceur Compiler や `jsx --harmony` でコンパイルできる AltJS と考えれば。

<script async class="speakerdeck-embed" data-id="b07645a0fadf0131d88c6a0d18b48761" data-ratio="1.33333333333333" src="//speakerdeck.com/assets/embed.js"></script>
