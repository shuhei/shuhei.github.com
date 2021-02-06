---
title: "NumPy などをインストール"
tags: [Python]
lang: ja
---

Ubuntu に Python の 数学ライブラリ、NumPy を入れようとしたらうまく入りませんでした。

[ubuntu linux で numpy, scipy, matplotlib を入れたときのメモ &#8211; my cartesian theater](http://d.hatena.ne.jp/tdm/20080223/1203793774)
のとおりにしたら、うまくいきました。
めでたしめでたし。

ただし、下記のように `svc` を `svn` に変えました。

```
svn co http://svn.scipy.org/svn/numpy/trunk numpy
```

ついでに入れた scipy は FFT とか科学っぽいライブラリ。
matplotlib は matlab 的な複雑なグラフが描けるとか。
こんな感じで使うらしい。
[scipy+matplotlib による 3 元連立常微分方程式の軌道 -](http://d.hatena.ne.jp/ytakenaka/20070106/p1 "Blog ’(Yasuto . Takenaka)")

・・・と思ったら、matplotlib がうまくインストールできませんでした。
時間ができたら、下記を参考に再度チャレンジしてみます。
[MatPlotLibHowTo &#8211; Community Ubuntu Documentation](https://help.ubuntu.com/community/MatPlotLibHowTo)
