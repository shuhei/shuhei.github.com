---
title: "ImageMagick で画像を一括リサイズ"
tags: []
lang: ja
---

特定の名前の画像をリサイズします。

```
#! /bin/bash

for f in rect_*.png;
do
  convert -resize 12x12! $f $f
done
```

コマンドラインは便利ですねー。
ひまを見てちょこちょこシェルスクリプトを勉強していきたいです。
