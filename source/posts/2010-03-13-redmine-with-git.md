---
title: "Git + Redmine"
tags: []
---

自宅サーバに入れた Redmine から Git レポジトリを参照できるように設定してみました。

## サーバにリポジトリを作成

Redmine を置いているサーバに空のリポジトリを作ります。

```
server$ mkdir myapp.git
server$ cd myapp.git
server$ git --bare init
```

## リモートリポジトリとして登録

ローカルのレポジトリにサーバのリポジトリを登録。Push します。

```
local$ git remote add origin ssh://username@example.com/path/to/myapp.git
local$ git push origin master
```

## Redmine の設定

プロジェクトの「設定」 => 「リポジトリ」で以下のように設定。

- バージョン管理システム => Git
- Path to .git directory => /path/to/myapp.git

以上で終了です。
プロジェクトの「リポジトリ」を確認すると、おお、見えました。
ブラウザで見るとぐちゃぐちゃなのがよくわかります・・・。

## チケットとコミットの連携

コミットメッセージに Redmine のチケット ID を含めることで、チケットとコミットの関連付けが行えます。
チケット ID 前のキーワードによって、関連付けの仕方を変えることができます。デフォルトでは refs で単純な参照、 fixes で進捗率 100% にするようになっているようです。
管理 => 設定 => リポジトリ で確認、設定できます。

## 参考 URL

- [せっかちな人のための git 入門 &#8211; git をインストールし、共同で開発できる環境を整えるまで : 僕は発展途上技術者](http://blog.champierre.com/archives/670)
- [Redmine と Git で作るプロジェクト開発環境 &#8211; プログラミングノート](http://d.hatena.ne.jp/ntaku/20090526/1243327903)
