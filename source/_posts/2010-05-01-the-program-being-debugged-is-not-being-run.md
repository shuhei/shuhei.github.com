---
layout: post
title: "The program being debugged is not being run."
published: true
date: 2010-05-01
comments: true
tags:
tags: []
---

久しぶりに iPhone アプリ開発を始め、実機テストをしようとしてみたところ &#8220;The program being debugged is not being run.&#8221; とのエラー。
そんなの見ればわかります。理由を書いてください。理由を。
アプリのインストール自体はできているのですが、デバッグができないようです。

[XCode fails to run app on device, saying the program being debugged is not being run &#8211; Stack Overflow](http://stackoverflow.com/questions/1727169/xcode-fails-to-run-app-on-device-saying-the-program-being-debugged-is-not-being) を読んでためしてみました。
オーガナイザで provisioning profile を一旦消して、新しくダウンロードしたやつを入れ直そうというものです。

しかし &#8220;DEVICES&#8220; => &#8220;iPhone&#8221; => &#8220;Provisionning&#8221; のところの &#8220;-&#8221; ボタンで消そうとしてみたものの、何故か消えず。&#8221;+&#8221; で上書きしようとしても効果なし。

&#8220;IPHONE DEVELOMENT&#8220; => &#8220;Provisioning Profiles&#8221; のところで消して &#8220;DEVICES&#8220; => &#8220;iPhone&#8221; => &#8220;Provisionning&#8221; で入れ直したら上手く動きました。
めでたしめでたし。

## 追記

・・・と思ったら、また同じエラーが出ました。
ソースをいじってコンパイルし直した直後に出るみたい。
その後もう一回試すと、ちゃんと起動しています。
うーん、不思議です・・・。
