---
title: "Python Challenge Lv. 8 - 9"
tags: [Ruby, Python]
lang: ja
---

## Level 8

とりあえず `<area>` タグの `coords` 属性を描いてみました。Ruby と [苦労してインストールした cairo](/blog/2009/10/12/install-cairo-with-gem/) を使用。

```rb
require 'cairo'

nums = [179,284,214,311,255,320,281,226,319,224,363,309,339,222,371,225,411,229,404,242,415,252,428,233,428,214,394,207,383,205,390,195,423,192,439,193,442,209,440,215,450,221,457,226,469,202,475,187,494,188,494,169,498,147,491,121,477,136,481,96,471,94,458,98,444,91,420,87,405,92,391,88,376,82,350,79,330,82,314,85,305,90,299,96,290,103,276,110,262,114,225,123,212,125,185,133,138,144,118,160,97,168,87,176,110,180,145,176,153,176,150,182,137,190,126,194,121,198,126,203,151,205,160,195,168,217,169,234,170,260,174,282]
points = []
while nums.size > 0 do
  points.push nums.slice!(0, 2)
end

def draw_points(points, width, height, filename)
  format = Cairo::FORMAT_ARGB32
  surface = Cairo::ImageSurface.new(format, width, height)
  context = Cairo::Context.new(surface)

  context.set_source_rgb(1, 1, 1)
  context.rectangle(0, 0, width, height)
  context.fill

  context.set_source_rgb(0, 0, 0)
  context.move_to(points[0][0], points[0][1])
  points.each do |p|
    context.line_to p[0], p[1]
  end
  context.stroke

  surface.write_to_png(filename)
end

draw_points(points, 640, 480, "fly.png")
```

しかし、ただの蠅の輪郭です。リンク部分の形ですね。で、今度は un 文字列を座標に見立てて線を引いてみたりしたのですが・・・。

```rb
un = "BZh91AY&SYA\xaf\x82\r\x00\x00\x01\x01\x80\x02\xc0\x02\x00 \x00!\x9ah3M\x07<]\xc9\x14\xe1BA\x06\xbe\x084"
un_points = []
0.step(un.size - 1, 2) do |i|
  un_points.push([un[i], un[i + 1]])
end

draw_points(points, 640, 480, "un.png")
```

全然違うようです・・・。こりゃあかんということで、フォーラムにヒントを見に行くと、Python のモジュールを探せ、un と pw の形式をよく見ろとのこと。共通する「BZh91AY&S」でググってみたところ、bzip2 のヘッダ部分だとか。知らんがな。ということで、Python の bz2 モジュールで解凍して答えを得ました。

```py
>>> import bz2
>>> un = "BZh91AY&SYA\xaf\x82\r\x00\x00\x01\x01\x80\x02\xc0\x02\x00 \x00!\x9ah3M\x07<]\xc9\x14\xe1BA\x06\xbe\x084"
>>> pw = "BZh91AY&SY\x94$|\x0e\x00\x00\x00\x81\x00\x03$ \x00!\x9ah3M\x13<]\xc9\x14\xe1BBP\x91\xf08"
>>> bz2.decompress(pw)
'file'
>>> bz2.decompress(un)
'huge'
```

## Level 9

Level 7 でやってみたのは、こっちの解法だったようです。
ということで、以下。

```rb
require 'cairo'

first = [略]
second = [略]

first_points = []
while first.size > 0 do
   first_points.push first.slice!(0, 2)
end

second_points = []
while second.size > 0 do
   second_points.push second.slice!(0, 2)
end

draw_points(first_points, 495, 495, "first.png")
draw_points(second_points, 495, 495, "second.png")
```

![first](/images/cow.png)

ということで、出てきた動物の名前をいくつか適当に入れると正解に。しかし、まだまだ四分の一。先は長いです・・・。
