---
title: "Visual C++ 2005 Express Edition で ARToolkit"
tags: []
---

ARToolkit、やっと自作プロジェクトで動きました。
Visual Studio の設定について書いたものはありましたが、プロジェクトの設定について詳しく書いたものがなかったので、メモ。

プロジェクトの新規作成時に、Win32 コンソールアプリケーション &#8594; Windows アプリケーション。

出力先フォルダには、ARtoolkit/bin にある DLL ファイルや Data フォルダをコピーしておきます。

プロジェクトの設定を下記のように変更。

- C/C++ &#8594; 全般 -> 追加のインクルードディレクトリ = ARToolkit/include
- リンカ &#8594; 全般 -> インクリメンタルリンクを有効にする = 既定値
- リンカ &#8594; 全般 -> 追加のライブラリディレクトリ = ARToolkit/lib
- リンカ &#8594; 入力 -> 追加の依存ファイル = libARd.lib libARgsubd.lib libARvideod.lib opengl32.lib glu32.lib glut32.lib

これで何とか動くように思います。
