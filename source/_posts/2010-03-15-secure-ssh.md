---
layout: post
title: "SSH を安全に"
published: true
date: 2010-03-15
comments: true
tags: []
---

自宅サーバの SSH を外から使えるようにするにあたり、セキュリティ対策を施してみました。

鍵認証のところ以外は [SSHD_CONFIG](http://www.unixuser.org/~euske/doc/openssh/jman/sshd_config.html "5") 参照。
下記設定をして ufw とルータの設定を変えたら、今のところそれらしく動いてます。

## パスワードではなく鍵認証に

クライアントで鍵を作って、サーバに公開鍵を置いておきます。クライアントが秘密鍵を持っていないと認証できないように設定。
念のためパスワードもかけておきました。

via [ssh にてパスワードを使用しないでログインする方法](http://www.turbolinux.co.jp/support/document/knowledge/152.html)

## ポートを変更

22 番ポートはいろんなところから攻撃されるということなので。

## ログインユーザの制限

そんなにいろんなユーザ作ってませんが、念のため。

## ルートログインの禁止

root ログインはユーザ名がばれているため禁止。使わないし。

## 試行回数の制限

鍵認証の場合はあまり関係ないかな？
