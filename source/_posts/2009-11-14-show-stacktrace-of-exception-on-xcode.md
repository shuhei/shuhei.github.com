---
layout: post
title: "Xcode で例外発生時のスタックトレースをデバッガに表示"
published: true
date: 2009-11-14
comments: true
tags:
tags: []
---

iPhone アプリの開発で例外が発生したとき、Xcode のコンソールにはスタックトレースのアドレス（？）が表示されるだけで、内容がわかりません。
Objective-C ランタイムの例外送出部分にブレークポイントを設定することで、例外発生時のスタックトレースやコード中のオブジェクトの値をデバッガで詳しく見ることができます。

## 方法

&#8220;実行&#8221; =&gt; &#8220;ブレークポイントを管理&#8221; =&gt; &#8220;シンボリックブレークポイントを追加&#8221; を実行します。

![](/images/2009/11/symbolic_break_point1.png)

出てきたダイアログに `objc_exception_throw` と入力。
これで、例外が発生した時にブレークされ、デバッガで詳細を見る事ができるようになります。

![](/images/2009/11/debugger1.png)

デバッガなので、もちろんコード中のオブジェクトの値を見ることもできます。便利ですね。

via [Debugging Tip – objc_exception_throw breakpoint | markjnet](http://www.markj.net/debugging-tip-objc_exception_throw-breakpoint/)

## シンボリックブレークポイント

通常のブレークポイントではソースコード中の行を指定しますが、シンボリックブレークポイントはシンボル単位で指定するブレークポイントです。
ですので「あの関数が呼ばれたらブレーク」や「あのクラスのあのメソッドが呼ばれたらブレーク」ということができます。
今回の objc_exception_throw は Objective-C のランタイム中にある例外を送出する関数のようですね。
