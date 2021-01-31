---
layout: post
title: "コマンドライン引数"
tags: []
---

OpenCV を触ってみようと思い、今まで避けてきた C 言語を勉強中です。
C++ や Objective-C を触るのにも必要ですからね。

で、まずは基本のキからということで、

```
#include <stdio.h>

int main(int argc, char** argv) {
  if (argc > 1) {
    printf("Hello, %s!", argv[1]);
  } else {
    printf("Hello, World!");
  }
}
```

`argc` はコマンドライン引数の個数、`argv` はコマンドライン引数の配列です。
コマンドライン引数にはプラグラム名も含まれるため、引数なしの場合でも argc は 1 となります。
また、 `argv` の方は `char* argv[]` とも書くことができ、引数の文字列へのポインタの配列です。
