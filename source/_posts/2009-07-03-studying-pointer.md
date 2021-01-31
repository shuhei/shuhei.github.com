---
layout: post
title: "ポインタの勉強"
published: true
date: 2009-07-03
comments: true
tags:
categories: []
---

ポインタについて勉強してみます。

## 変数のアドレス

```cpp
int value = 10;
```

のとき `&value` で変数 `value` のメモリ上のアドレスがわかります。

## ポインタ

メモリ上のアドレスを格納する変数がポインタです。

```cpp
int value = 10;
int *ptr;
ptr = &a;
```

という感じです。

## ポインタの指す値

`ptr` の指すアドレスにある変数の値をとるには `*ptr` と書きます。

```cpp
printf("*ptr の値は %d です。", *ptr); // *ptr の値は 10 です。
```
