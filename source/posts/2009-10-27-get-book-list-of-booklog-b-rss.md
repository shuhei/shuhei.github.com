---
title: "Booklog の本一覧をRSSから取得"
tags: []
lang: ja
---

以前 [リスト形式の本棚からスクレイピングして本の一覧を取得する記事](/blog/2009/10/12/get-book-list-from-booklog/) を書きましたが、RSS を使うともっと楽にできるようです。
以下のように、GET のパラメータで page や perpage を渡すと、その通り返してくれます。

[http://booklog.jp/users/branchiopoda/feed?page=1&perpage=500](http://booklog.jp/users/branchiopoda/feed?page=1&perpage=500)

著者名が入っていないのが残念ですが、カテゴリや Amazon の画像 URL が入っているのでなかなか使えそうですね。
