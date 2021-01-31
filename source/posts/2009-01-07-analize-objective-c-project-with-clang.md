---
layout: post
title: "clang で Objective C の静的解析"
tags: [iPhone 開発]
---

[clang](http://clang.llvm.org/StaticAnalysis.html) というツールを使うと、Objective C や C、C++ などのコードを解析してバグを発見してくれるそうです。
静的な意味で。

[iPhone アプリ開発にかかせない静的解析ツール「clang」 : アシアルブログ](http://blog.asial.co.jp/504) などを参考にしてやってみたのですが、バグが発見されずレポートが出ませんでした。
残念。

```
scan-build -o {レポート出力先パス} xcodebuild
```

あ、あと MacBook 買いました。
