---
layout: post
title: "Python で implode"
published: true
date: 2008-06-22 15:23
comments: true
tags:
categories: [Python]
---

PHP などで、配列の要素をあいだに何を挟みながらくっつけて文字列にする関数 implode。

```
$output = implode(",", $arr);
```

同じことをしようとすると、Python では、以下。

```
output = ",".join(arr)
```

少し変態っぽいですね。
