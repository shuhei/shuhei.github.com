---
title: "Proce55ing から 動画を作る"
tags: [Proce55ing]
lang: ja
---

Proce55ing で作った Sketch を動画にする方法です。
やり方は簡単。

まず、Proce55ing から連番の静止画を書き出します。
draw メソッドの中で、saveFrame() を呼び出せば OK。
これで、フレームごとに screen-XXXX.tif という画像が書き出されます。

そして、ffmpeg で連番の静止画から動画を作成します。
コマンドプロンプトで下記のようにすると、30 fps で mpeg ファイルが書き出されます。
ちなみに、%04d の部分は「数字が 4 つ」の意味です。

```
ffmpeg -r 30 -i "screen-%04d.tif" -vcodec mjpeg -sameq test.avi
```

簡単ですね。
