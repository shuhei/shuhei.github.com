---
layout: post
title: "OpenGL のブレンディング方法について"
tags: [C/C++, OpenFrameworks]
---

OpenFrameworks が iPhone 上で動くというので、触ってみています。ついこの前、Objective-C やりますと書きましたが、最近 C++ がマイブームなので・・・。

そこで調べてみた OpenGL のブレンディングについてメモ。一言で言うと、ブレンディングとは画像に画像を合成することです。Photoshop などでは、レイヤーとレイヤーの画像の合成の方法をブレンドモードと言っていますね。OpenGL では自分で書く訳ですから、ブレンディングの方法をさらに柔軟に指定できます。

## まずは有効に

ブレンディングを有効にするには以下の関数を呼ばなければなりません。

```cpp
glEnable(GL_BLEND);
```

## 設定関数

ブレンドする二つの画像を source と destination とします。OpenGL では、これから描くのが source、destination はフレームバッファ上の画像だそうです。

### glBlendFunc

`glBlendFunc` では、それぞれの画像の RGBA にかける係数を設定します。下記は一例です。

- `GL_ONE` RGBA 全てを 0 にする
- `GL_ZERO` RGBA 全てそのまま
- `GL_SRC_ALPHA` RGBA 全てに source の A をかける

### glBlendEquation

`glBlendEquation` では、画像同士の RGBA を合成する方法を設定します。

- `GL_FUNC_ADD` 足す
- `GL_FUNC_SUBTRACT` source から destination を引く
- `GL_FUNC_REVERSE_SUBTRACT` destination から source を引く
- `GL_MAX` 大きい方をそのまま使う
- `GL_MIN` 小さい方をそのまま使う

### その他

iPhone では `glBlendEquation` ではなく `glBlendEquationOES` を使いますが、働きは同じもののようです。また `glBlendFunc` や `glBlendEquation` では RGBA 全てを一緒に設定しますが、 `glBlendFuncSeparate` や `glBlendEquationSeparate` を用いると RGB と Alpha を別々に設定できるようです。

## 実例

### Additive blending

光の表現に。暗めの色を重ねていくと、ぼんやりと光るようないい感じになります。

```cpp
glBlendEquationOES(GL_FUNC_ADD); // デフォルトは GL_FUNC_ADD のようで必要ないかも
glBlendFunc(GL_ONE, GL_ONE);
// glBlendFunc(GL_ONE, GL_ONE_MINUS_SRC_COLOR); // こっちの方がいい感じになるとか・・・。
```

### フェードアウト

もっといい方法があるかもしれませんが、他にやり方が思いつかなかったので。

```cpp
glBlendEquationOES(GL_FUNC_REVERSE_SUBTRACT_OES); // 暗くするため、元画像から引く
glBlendFunc(GL_ONE, GL_ONE); // そのまま
ofSetColor(10, 10, 10, 0); // 少しずつ暗くします
ofRect(0, 0, ofGetWidth(), ofGetHeight()); // 画面全体に適用します
```
