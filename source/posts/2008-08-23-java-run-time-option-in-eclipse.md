---
title: "Eclipse で Java VM の実行時オプション"
tags: [Java]
lang: ja
---

Java の VM の実行時オプションをを指定するには、Run &#8594; Run Configuration -> arguments で Java Application の中から Project を選び、 Arguments タブの VM arguments のところに書きます。
なかなかわからなくて苦労したのでメモ。

ちなみに、Proxy サーバを指定するには以下。

```
-DproxySet=true -DproxyHost=xxx.xxx.xxx.xxx -DproxyPort=yyyy
```

フォントをアンチエイリアスするにはこんな感じ。

```
-Dswing.aatext=true
```
