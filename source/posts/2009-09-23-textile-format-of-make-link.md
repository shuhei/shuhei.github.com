---
title: "Make Link の Textile 2 用フォーマット"
tags: []
lang: ja
---

Firefox の Addon [Make Link](https://addons.mozilla.org/ja/firefox/addon/142) はページのタイトルや URL からリンクを作ってクリップボードに貼ってくれるアドオンです。ブログ記事にリンクを載せる際に重宝します。フォーマットを自分で作る事もできる点が大変便利。
とうことで、Textile 2 用のフォーマットを作ってみました。

## ページ名と URL

```
"%text%":%url
```

テキストを選択せずに使用します。 `%text%` を `%title%` にすると何故か上手く行きません。

## 引用（引用元とその URL 付き）

```
bq.. %text%

"??%title%??":%url%
```

引用するテキストを選択して使用します。引用文の末尾に引用元のページ名とそのリンクが付きます。
