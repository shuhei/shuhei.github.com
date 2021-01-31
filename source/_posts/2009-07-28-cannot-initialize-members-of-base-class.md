---
layout: post
title: "基本クラスのメンバを初期化できない"
published: true
date: 2009-07-28
comments: true
tags:
categories: [C++]
---

またまた少しはまりました。

C++ のコンストラクタは、基本クラスのメンバを初期化できないそうです。
以下のように書くとエラーになります。

```cpp
class A {
protected:
  int foo;
};

class B : public A {
public:
  B(int value) : foo(value) {
  }
};
```

親クラスのコンストラクタでも初期化をしていると、子クラスのコンストラクタで初期化しても上書きされてしまうからでしょうか。なかなか面倒なものですね。

参考サイト:

- [覚え書き：C++のコンストラクタに関する注意点 - A7M の日記](http://slashdot.jp/~A7M/journal/311876)
