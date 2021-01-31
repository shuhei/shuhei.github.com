---
layout: post
title: "Python Challenge Lv. 6 - 7"
date: 2009-10-11
tags: []
---

システムアーキテクトの試験が来週末に迫っているのですが、またまたやってしまいました。現実逃避。
試験前ということを除けば、面白いし、自然と勉強になるので良いのですけどね。

## Level 6

アドレスバーに何度も channel.zip と入れるも、ファイルがダウンロードされていることになかなか気付かず。気付いてファイルを解凍し、Level 4 的なプログラムで &#8220;Collect the comments.&#8221; に辿りつきましたが、意味がわかりません。
少しカンニングしてみると、ZIP ファイルは中身のファイル毎にコメントを付けられるのだとか。Python の zipfile モジュールで見られるらしいので、やってみました。

```py
num = "90052"
z = zipfile.ZipFile("channel.zip")

while True:
  # Print file's comment
  print z.getinfo(num + ".txt").comment,
  # Get next nothing
  s = open(num + ".txt").read()
  m = pattern.match(s)
  if m:
    num = m.group(1)
  else:
    break
```

Python で改行なしの出力をするには `print "foo",` なんですね。
いつのまにか Python で解いてしまってますね・・・。

## Level 7

```py
from PIL import Image
image = Image.open("oxygen.png")
width = image.size[0]
data = list(image.getdata())

before = 0
message = ""
for x in range(width):
  tmp = data[x + width * 46][0]
  if tmp != before:
    message += "%c" % (tmp)
    before= tmp

print message
```

これで下記メッセージが表示されるのですが、この配列の意味がわかりません・・・。

> smart guy, you made it. the next level is [105, 10, 16, 101, 103, 14, 105, 16, 121]ljljlimkljhdfdcdfa]\_a

少しカンニングをして気がついたのですが、 `if tmp != before:` としているのがマズかったようです。これだと同じ文字が続く場合に無視されてしまいます。
気を取り直して以下。書き方も少し Python らしく（？）。
`chr` という関数があったんですね。

```py
from PIL import Image
image = Image.open("oxygen.png")
width = image.size[0]
data = list(image.getdata())
message = []
i = 0
while True:
  color = data[i + width * 46]
  if color[0] == color[1] == color[2]:
    message.append(color[2])
    i += 7
  else:
    break

print "".join(map(chr, message))
```

出てきたメッセージから答えを出します。

```py
print "".join(map(chr, [105, 110, 116, 101, 103, 114, 105, 116, 121]))
```

何だかカンニングしてばかりですね・・・。
