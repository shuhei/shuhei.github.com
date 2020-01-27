---
layout: post
title: "const とポインタ"
published: true
date: 2009-08-01 14:45
comments: true
tags:
categories: [C/C++]
---

下のように `const` は型名の前後どちらに書いても同じです。

```cpp
const int a = 1;
int const b = 2;
```

[Bjarne Stroustrup&#8217;s C++ Style and Technique FAQ](http://www.research.att.com/~bs/bs_faq2.html#constplacement) では、前者がわかりやすくおすすめとされていますが。

では、ポインタについてはどうでしょうか？

```cpp
const int* pa = new int(10);  // "const な int" へのポインタ
int const* pb = new int(11);  // "const な int " へのポインタ
int* const pc = new int(12);  // int への  "const なポインタ"
```

一つ目と二つ目は同じです。では、どのような挙動になるのでしょうか？

```cpp
// *pa = 20;  // エラー！ "const な int" の値を変えることはできない
// *pb = 21;  // エラー！ "const な int" の値を変えることはできない
*pc = 23;

delete pa;   // delete はできる
delete pb;   // delete はできる
delete pc;

pa = NULL;
pb = NULL;
// pc = NULL;  // エラー！ポインタ自体が const なため
```

というような感じになります。普通は `const int* pa` の方を使う機会が多いような気がしますね。
