---
layout: post
title: "Ruby で Windows のコマンド実行"
published: true
date: 2009-09-30
comments: true
tags:
tags: [Ruby]
---

バッチファイルだけでは難しい処理をしたい時などに。そういう時は PowerShell を使うといいのかもしれませんが。

```rb
ret = system "cmd.exe /c dir"
```
