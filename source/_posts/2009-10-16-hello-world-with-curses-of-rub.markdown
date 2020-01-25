---
layout: post
title: "Ruby の Curses で Hello, World!"
published: true
date: 2009-10-16 00:14
comments: true
tags:
categories: []
---

以前から wget の進行状況表示など、コマンドラインでアニメーションを表示するにはどうやってやるのか気になっていました。
[sl コマンド](http://www.tkl.iis.u-tokyo.ac.jp/~toyoda/) のソースを覗くと curse.h なるものを使っています。Ruby でもできるのかな？と思い、やってみました。
参考にしたのは [Ruby の Curses を使ってコンソールを制御する（1/2）：CodeZine](http://codezine.jp/article/detail/2086) と [curses &#8211; Ruby リファレンスマニュアル](http://www.ruby-lang.org/ja/man/html/curses.html) 。

```
require 'curses'

message = [
  "**   **  *******  **       **        *****    **",
  "**   **  **       **       **       **   **   **",
  "*******  *******  **       **       **   **   **",
  "**   **  **       **       **       **   **     ",
  "**   **  *******  *******  *******   *****    **"
]

def animate(image)
  include Curses
  init_screen
  y = ((lines - image.size) / 2).truncate
  (cols - image[0].size).downto(1) do |t|
    image.size.times do |i|
      setpos(y + i, t)
      addstr(image[i])
    end
    refresh
    sleep(0.05)
    clear
  end
close_screen
end

animate(message)
```

おおー、動きました。逆に新鮮で面白いですね。
