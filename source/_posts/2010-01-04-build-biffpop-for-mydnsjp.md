---
layout: post
title: "MyDNS.jp 用に biffpop をビルド"
date: 2010-01-04
tags: []
---

無料ダイナミック DNS サービスの MyDNS.jp では、IP アドレスの通知にメールサーバへのアクセスという方法を採用しています。
POP のクライアントソフトとして説明ページでおすすめされていた [biffpop](http://www.nakata-jp.org/computer/freesoft/biffpop.html) をビルドする際につまずいたのでメモ。
環境は Ubuntu Server 9.10 64 bit。

ソースをダウンロードして make すると、下記のようなエラー。

> cc -O3 -DIPv6 -DKILLLIST -DUSE_SSL -c -Wall biffpop.c -o biffpop.o
> biffpop.c:24:25: error: openssl/ssl.h: No such file or directory
> biffpop.c:25:25: error: openssl/err.h: No such file or directory
> biffpop.c:47: error: expected ‘=’, ‘,’, ‘;’, ‘asm’ or ‘**attribute**’ before ‘\*’ token
> biffpop.c: In function ‘main’:
> biffpop.c:124: error: ‘\_RE_SYNTAX_POSIX_COMMON’ undeclared (first use in this function)
> biffpop.c:124: error: (Each undeclared identifier is reported only once
> biffpop.c:124: error: for each function it appears in.)
> biffpop.c:127: warning: implicit declaration of function ‘SSL_load_error_strings’
> biffpop.c:128: warning: implicit declaration of function ‘SSL_library_init’
> biffpop.c:129: error: ‘ctx’ undeclared (first use in this function)
> biffpop.c:129: warning: implicit declaration of function ‘SSL_CTX_new’
> biffpop.c:129: warning: implicit declaration of function ‘SSLv23_client_method’
> biffpop.c:130: warning: implicit declaration of function ‘ERR_print_errors_fp’
> biffpop.c:138: warning: implicit declaration of function ‘SSL_CTX_free’
> biffpop.c:139: warning: implicit declaration of function ‘ERR_free_strings’
> biffpop.c: In function ‘readConfigFileSub’:
> biffpop.c:439: warning: implicit declaration of function ‘re_compile_pattern’
> biffpop.c:440: warning: assignment makes pointer from integer without a cast
> make: \*\*\* [biffpop.o] Error 1

OpenSSL は入っているのにおかしいな、と思ったのですが、libssl-dev がいるっぽいです。
[openssl/ssl.h: No such file or directory [Archive] &#8211; Qmailrocks.org Forum](http://forum.qmailrocks.org/archive/index.php/t-963.html)

```
sudo apt-get install libssl-dev
make
```

まだ少しエラー。

> cc -O3 -DIPv6 -DKILLLIST -DUSE_SSL -c -Wall biffpop.c -o biffpop.o
> biffpop.c: In function ‘main’:
> biffpop.c:124: error: ‘\_RE_SYNTAX_POSIX_COMMON’ undeclared (first use in this function)
> biffpop.c:124: error: (Each undeclared identifier is reported only once
> biffpop.c:124: error: for each function it appears in.)
> biffpop.c: In function ‘readConfigFileSub’:
> biffpop.c:439: warning: implicit declaration of function ‘re_compile_pattern’
> biffpop.c:440: warning: assignment makes pointer from integer without a cast
> make: \*\*\* [biffpop.o] Error 1

今度は regex.h のエラー。ソースを見てみると `_RE_SYNTAX_POSIX_COMMON` は `#ifdef __USE_GNU` で囲まれています。
`__USE_GNU` をオンにするには `#define _GNU_SOURCE` するか `cc -D _GNU_SOURCE` すれば良いらしい。

・・・ということまではわかりましたが、よく考えると上記二つは `-DKILLLIST` と `-DUSE_SSL` をつけなければ起きないエラーです。SSL も正規表現によるメールの削除も、今回の用途には必要ありません。

Makefile を よく読むと `#FLAGS = -O3 # for mydns.jp system simple function` と書いてありました。
親切にも MyDNS ユーザ用のオプションが用意されていた訳です。
この行のコメントを外し、フルオプションの方（ `FLAGS = -O3 -DIPv6 -DKILLLIST -DUSE_SSL # full option IPv6, Kill List & SSL` ）をコメントアウトすると、ビルドできました。
めでたしめでたし。
