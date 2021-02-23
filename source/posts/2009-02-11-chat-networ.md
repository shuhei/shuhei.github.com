---
title: "Chat Network"
tags: [Proce55ing, 情報デザイン]
lang: ja
---

前回に引き続き、Processing。
某チャットルームの人間関係を視覚化してみました。

[ChatNetwork](/works/chart_network/)

丸の大きさが発言回数、線の太さが発言の隣接回数を表しています。
同じくらいの発言回数の相手とでも、人によって隣接回数が異なるのがわかるかと思います。

今後の展望としては、片想い、両想いで線の色を変えると面白いかもしれません。
あとは、元データを DB からリアルタイムで取ってくるとか。

例によってスケッチなのでソースコードはグチャグチャです。
個人的には Processing が日本語が表示できるようになっていたことに驚きました。
beta がとれただけのことはあります。