---
layout: post
title: "Ruby で Windows のコマンド実行"
tags: [Ruby]
---

バッチファイルだけでは難しい処理をしたい時などに。そういう時は PowerShell を使うといいのかもしれませんが。

```rb
ret = system "cmd.exe /c dir"
```
