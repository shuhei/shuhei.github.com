---
layout: post
title: "karma-6to5-preprocessor"
date: 2014-11-13
comments: true
categories: [JavaScript, Karma, EcmaScript6]
---

最近 [6to5](https://github.com/6to5/6to5) を使って ES6 を書いています。ES6 を使うには Traceur Compiler なんかもありますが、クライアント側に結構重い runtime を入れる必要があって気が進みません。そこで runtime のいらない 6to5。

今作っているのは Angular アプリなので、テストは Karma。6to5 の Preprocessor が必要です。当然あるだろうと思って検索したのですが、ない。なかったので作りました。

[karma-6to5-preprocessor](https://www.npmjs.org/package/karma-6to5-preprocessor)

ES6 で書いたスクリプトを Karma でテストすることができるようになります。Sourcemap を含めた設定例は README を見てみてください。

その後、ES6 Module も使うことにして、Browerify の transform として 6to5 と同じ作者が作っている [6to5-browserify](https://github.com/6to5/6to5-browserify) を使うようにしました。すると Karma の方でも Browerify を使えばいいので karma-6to5-preprocessor は使う必要がなくなってしまったのです。結構需要がありそうなのに、何でなかったんだろうと思っていたのですが、これで謎がとけました。

それでも、ES6 Modules は使わないけど ES6 の便利な機能は使いたいという人はいるようで、ちょこちょこダウンロードされています。良かった良かった。
