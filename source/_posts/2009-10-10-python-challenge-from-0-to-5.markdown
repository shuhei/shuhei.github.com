---
layout: post
title: "Python Challenge Lv. 0 - 5"
published: true
date: 2009-10-10 15:38
comments: true
tags:
categories: []
---

ふと mixi の Python コミュニティを覗いたら [Python Challenge](http://www.pythonchallenge.com) なるものを発見。
プログラムを書いて解いてゆくクイズです。面白そうなのでやってみました。
最近マイブームな Ruby で。

以下、ネタバレ注意です。

## Level 0

```
2 ** 38
```

## Level 1

```
cipher = "g fmnc wms bgblr rpylqjyrc gr zw fylb. rfyrq ufyr amknsrcpq ypc dmp. bmgle gr gl zw fylb gq glcddgagclr ylb rfyr'q ufw rfgq rcvr gq qm jmle. sqgle qrpgle.kyicrpylq() gq pcamkkclbcb. lmu ynnjw ml rfc spj."
abc = ("a"[0] .. "z"[0]).to_a
cde = ("c"[0] .. "z"[0]).to_a + ["a"[0], "b"[0]]
dict = Hash[*abc.zip(cde).flatten]
cipher.bytes do |ch|
  ch = dict[ch] if dict.has_key?(ch)
  printf("%c", ch)
end
```

## Level 2

ターミナルにコピペしたらおかしくなったので、一旦 mess_2.txt に保存。

```
File.open("mess_2.txt") do |f|
  while ch = f.getc
    printf("%c", ch) if ("a"[0] .. "z"[0]).include?(ch)
  end
end
```

ファイルの中身を 1 バイトずつ読み込んで、アルファベットだけ抜き出します。

## Level 3

```
pattern = /[^A-Z][A-Z]{3}([a-z])[A-Z]{3}[^A-Z]/
File.open("mess_3.txt") do |f|
  p f.read.scan(pattern).to_s
end
```

Ruby でグローバルマッチしたい時って `String#scan` 使うしかないの？

## Level 4

```
num = "12345"
require "net/http"
def get_nothing(num)
  return Net::HTTP.get URI.parse("http://www.pythonchallenge.com/pc/def/linkedlist.php?nothing=" + num)
end
400.times do
  content = get_nothing(num)
  m = /and the next nothing is ([0-9]+)/.match(content)
  p num
  p content
  if m != nil then
    num = m[1]
  else
    exit
  end
end
```

途中でひっかけがありますが・・・。そこは手作業で。

## Level 5

意味がわからずカンニング。
[Python Challenge level 5: “peak hell” | UnixWars](http://unixwars.com/2007/09/11/python-challenge-level-5-peak-hell/?wscr=1280x800)
Python の Pickle モジュールを使う問題だとか。知らんがな。

```
import urllib, pickle
uri = "http://www.pythonchallenge.com/pc/def/banner.p"
obj = pickle.load(urllib.urlopen(uri))
for line in obj:
  l = ""
  for pair in line:
    l += pair[0] * pair[1]
    print l
```

## 今日はここまで

続きはまた今度。
