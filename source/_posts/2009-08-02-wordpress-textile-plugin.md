---
layout: post
title: "Wordpress の Textile プラグイン"
published: true
date: 2009-08-02
comments: true
tags:
tags: [Wordpress]
---

どうもしっくり来るのがありませんでした。

[Textile2](http://wordpress.org/extend/plugins/textile-2/) というのが直球のネーミングで良さそうだったのですが、日本語が化けるのでやめました。
[対策](http://wordpress.org/support/topic/253662) を試すと大体直ったものの、 `pre` タグで囲った部分の文字化けが直らず。 `pre` タグを使うのはコードだけなので、日本語を使わなければいい話なのですが、コメントは日本語で書きたいので。
ヘッダタグのオフセットなど素敵な機能がついていただけに残念です。

結局 [Textiler](http://wordpress.org/extend/plugins/textiler/) というのを採用。何だか評判がよくありませんが、文字化けはしないようです。ただ、リストが途中で分割されてしまうなど不思議な動きをしていますが・・・。

何はともあれ、Textile を使えるようになりました。タグを打つ必要がなく、とてもいいですね。やはり CMS はこうでなくては。
