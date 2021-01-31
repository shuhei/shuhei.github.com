---
layout: post
title: "クラスの前方宣言"
tags: [C++]
---

1 時間ほどハマりました。下のようなコードで `A::foo` のところでコンパイルエラーです。

> C4430: 型指定子がありません - int と仮定しました。メモ: C++ は int を既定値としてサポートしていません

```cpp
enum GREETING { HELLO, NI_HAO, CIAO };

class A {
public:
  GREETING foo(B* b);  // コンパイルエラー！
}

class B {
public:
  void bar(A* a);
}
```

B は下でしっかり宣言しているのに型がないと言われるので、enum の使い方が違うのかと思いいろいろ調べていたのですが・・・。`class A` の宣言の前に B の前方宣言が必要なんですね。

```cpp
class B;

class A {
  // ...
}
```

一回勉強したのですが、すっかり忘れていました。この辺は勝手に上手くやってくれる Java や C# のありがたみを感じます。
