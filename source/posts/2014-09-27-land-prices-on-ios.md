---
layout: post
title: "WebGL な日本の地価マップをタッチ対応してみた"
tags: [WebGL, JavaScript]
---

iOS 8 の Safari で WebGL が動くようになったので、以前作った日本の地価の 3D で表示するやつをタッチ対応してみました。

![Land Prices in Japan on iOS 8 Safari](/images/webland-ios.png)

[Land Prices in Japan](/webland)

ソースは [GitHub にあります](https://github.com/shuhei/webland)。

タッチ対応というのは、大体以下のような感じです。

- Viewport が動かないように調整。
- ドラッグで上下左右に動けるように。タッチデバイスかどうがで、タッチ系のイベントを使うかマウス系のイベントを使うかを切り替えています。
- ピンチでズームできるように。難しいかなと思ったんですが、`gesturestart`, `gesturechange`, `gestureend` イベントがあったので簡単でした。
- ダブルタップで視点を切り替えられるように。ダブルタップやダブルクリックのイベントというのは特にないので、`touchstart` の時に一個前のイベントの時刻と比較して判断しています。

早速買い換えた iPhone 6 Plus でぬるぬる動く上に、iPhone 5 でも余裕で動きます。直接触れるので、画面は小さいものの PC より楽しいなあと思いました。今後はモバイルでの WebGL が面白そうですね。
