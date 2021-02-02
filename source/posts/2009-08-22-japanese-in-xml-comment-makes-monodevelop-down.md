---
title: "OSX 上の MonoDevelop の日本語対応"
tags: [C#]
---

MonoDevelop Mac Preview 09/07/06 版をインストールしてみました。MonoDevelop 2.2 Beta リリース前のプレビュー版だそうです。
プレビュー版だけあっていろいろ動作があやしいです。そして日本語、というかマルチバイト対応がさっぱりです。
以下、できるだけ日本語使えるようにするためのメモ。

## スタートページやメニューの文字化け

まず目につくのがこれ。`/Library/Framework/Mono.Framework/Version/Current/etc/pango/pango.aliases` というファイルを作成し、以下の内容を書くと直るようです。

```
"Lucida Grande" = "Hiragino Kaku Gothic Pro"
```

pango なるもののバグだとか。

via [っき雑記: MonoDevelop 2.0 Alpha の Mac OS X 版で日本語を表示する方法](http://kki-zakki.blogspot.com/2008/12/monodevelop-20-alphamac-os-x.html)

## ファイルは UTF-8 でないと化ける

Shift-JIS のファイルを UTF-8 に置換しましょう。VisualStudio に戻した時にも問題ないはずです。

```sh
find . -name '*.cs' -print0 | xargs -0 nkf -w -Lu --overwrite
```

## なんと日本語が入力できない

我慢しましょう。どうしてもという時はコピペができます。

## XML 内の日本語

XML コメントの中の一行で日本語が何文字か続いた後、改行せずにタグを閉じると落ちるようです。
つまり、以下のようなもの。

```
/// <param name="hoge">ほげほげほげ</param>
```

当面の回避策は、タグを閉じる前に改行することでしょうか。

```
/// <param name="hoge">ほげほげほげ
/// </param>
```

ちょっとどうかと思いますが、これなら落ちません。

### 置換

```sh
perl -i.bak -pe 's/(\t+\/\/\/ )(.+)(<\/(param|returns)>)/$1$2\n$1$3/mg' hoge.cs
```

一括置換は以下。

```sh
find . -name '*.cs' -exec perl -i.bak -pe 's/(\t+\/\/\/ )(.+)(<\/(param|returns)>)/$1$2\n$1$3/mg' {} \;
```
