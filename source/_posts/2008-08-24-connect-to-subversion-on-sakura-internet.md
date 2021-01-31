---
layout: post
title: "さくらインターネット上の Subversion につなぐ"
date: 2008-08-24
tags: [さくらインターネット]
---

- [ナナタイサン» ブログアーカイブ » さくらに Trac をインストール・・・失敗](/blog/2008/08/14/failed-to-install-trac-at-sakura-internet/)
- [ナナタイサン» ブログアーカイブ » さくらに Trac をインストール・・・成功](/blog/2008/08/23/succeed-to-install-trac-at-sakura-internet/)

上記二つに続けて、さくらインターネットへインストールした Subversion に SSH でつなぎます。
使うのは TortoiseSVN。

## 公開鍵と秘密鍵

puttygen.exe を実行して、マウスをグリグリします。
上のテキストエリアに公開鍵、下に秘密鍵が出てきます。

### 公開鍵

コピペして下記のように編集。

```
command="/home/username/local/bin/svnserve -t" ssh-rsa 公開鍵
```

authorized_keys という名前で保存し、\$HOME/.ssh/authorized_keys となるようにアップします。

### 秘密鍵

コピペして適当な名前で、TortoiseSVN/bin に保存。
これはどこでもいいそうですが、後でパスを指定します。

## TortoiseSVN の設定

適当なフォルダを右クリックし、TortoiseSVN の 設定画面を開きます。
Network &#8594; SSH &#8594; SSH client のところで下記のように設定。

```
"C:\Program Files\TortoiseSVN\bin\TortoisePlink.exe" -l username -i "C:\Program Files\TortoiseSVN\bin\private_key.ppk"
```

あとは下のような感じでレポジトリにアクセスできます。

```
svn+ssh://username@hostname/home/username/local/bin/repo
```
