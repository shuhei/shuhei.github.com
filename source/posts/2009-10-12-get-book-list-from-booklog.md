---
title: "Booklog から本一覧を取得"
tags: []
lang: ja
---

[web 本棚サービス ブクログ](http://booklog.jp/) がリニューアルしたというので [再開しました](http://www.booklog.jp/users/branchiopoda)。ペパボの公式サービスとなり、メンテナンスやサービスの追加をどんどんやって行くそうです。今回のリニューアルで一番うれしいのが、本の登録機能の強化です。

> ご要望で最も多かったものの一つが、もっと本を簡単に登録したい！ １冊１冊登録するのが面倒くさい！というものでした。 今回のリニューアルでは、 ページ遷移をせずに、簡単に複数の本を登録できるように改善しています。

[ブクログがリニューアルいたしました。 | ブクログお知らせブログ](http://info.booklog.jp/?eid=78)

さくさく登録できて素晴らしいです。

今のところ API はないようで、何かをしたいときにはスクレイピングする必要があります。とりあえず Ruby で本の一覧を取得してみました。

```rb
require 'rubygems'
require 'hpricot'
require 'open-uri'

class Book
  def initialize(title, url)
    @title = title
    @url = url
  end
  def asin
    @url.split("/").last
  end
  attr_accessor :title, :url
end

def get_books(username)
  doc = Hpricot(open("http://www.booklog.jp/users/#{username}/All?display=list"))
  books = []
  (doc/"div#shelf div.list ul li").each do |book|
    title = (book/:a).first.inner_html
    url = (book/:a).first[:href]
    books.push(Book.new(title, url))
  end
  books
end

books = get_books("branchiopoda")
books.each do |book|
  puts "#{book.title} => #{book.asin}"
end
```

一覧から取れるのはタイトルと ASIN コードだけなので、それ以上の情報を得るには、個別のページや Amazon の API を見る必要がありますね。一つ一つ見てゆくのは大変ですし、情報の更新も行いたいので、今後の API の公開に期待です。
