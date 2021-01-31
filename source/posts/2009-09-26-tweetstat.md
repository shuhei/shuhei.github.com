---
layout: post
title: "TweetStats"
tags: []
---

[TweetStats](http://tweetstats.com/) をなるものをやってみました。Twitter のつぶやきを読み込んで、さまざまな統計情報を表示してくれるサービスです。

僕のは [こんな感じ](http://tweetstats.com/graphs/7to3) 。
時系列で発言数を見ると、2007 年頃は IM ごしにかなりつぶやいていて、2008 年頃はあまり使わなくなり、iPhone 使うようになってまた使いだした、という感じです。曜日別で見ると、何故か月、木、土の午後が活発ですね。

発言した単語でタグクラウドのようなものを作ってくれる Tweet Cloud の方は、有意な情報があまり得られませんでした。日本語はスペース区切りでないためです。
[MeCab](http://mecab.sourceforge.net/) や [Yahoo! の日本語形態素解析](http://developer.yahoo.co.jp/webapi/jlp/ma/v1/parse.html) などを使って、しっかり日本語に対応してみると面白いかもしれません。
