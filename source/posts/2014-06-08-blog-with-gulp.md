---
title: "Gulp でブログを書く"
tags: [JavaScript, gulp]
---

もともと Octopress/Jekyll 製だったこのブログを、Ruby を捨てて gulp でページを生成するように書き直しました。

[shuhei.github.io / gulpfile.babel.js](https://github.com/shuhei/shuhei.github.com/blob/source/gulpfile.babel.js)

ディレクトリ構成は Octopress そのまま。rake タスクではなく、gulp のタスクでサイトをビルド、デプロイします。

機能は本当に最小限で、記事ページ、静的ページと index, archive の生成だけです。

## 経緯

動機は Jekyll が重くビルドに時間がかかること。他のもっと良いのがないかなあと思っていたのですが、そもそも大した機能は必要ないので、今年の初めにはまっていた gulp で自作しました。

ビルドの部分は、ファイルを変換して書き出すという gulp でやりやすいタスクです。ただ GitHub Pages にデプロイする部分は git のコマンド実行が続くため面倒で、その部分だけ gulp で実装せずにRakefile をそのまま残していました。

どうも気持ち悪かったので、ついに重い腰を上げて書いてみました。当初 child_process を使って書いたのですが、[gulp-shell](https://github.com/sun-zheng-an/gulp-shell)を見つけて使うようにしたらすっきりしました。

## 操作

gulp でビルドします。

```shell
gulp
```

表示を確認しながら編集したいときは、以下でローカルにサーバが立ち上がり、ファイル変更時にビルドしなおしてくれます。

```shell
gulp watch
```

デプロイも gulp タスクです。

```shell
gulp deploy
```

## 感想

当たり前の感想ですが、gulp はデプロイのようなタスクには向いてないものの、 静的サイトの生成には悪くないなと思いました。

とは言え、サイト全体の情報を扱うのはやりにくいです。現在は index, archive のページを、各記事の stream から分岐して作っています。また、必要ないと思いサイドバーをつけていないのですが、つける場合には一旦全記事を読み込んでサイドバー向けの情報を作ってから各記事のページにくっつける必要があります。その辺は今後の課題ですかね。
