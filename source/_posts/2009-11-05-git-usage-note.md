---
layout: post
title: "git の使い方メモ"
published: true
date: 2009-11-05
comments: true
categories:
---

## 無視リスト

&#8220;.gitignore&#8221; というファイルを作って、その中に無視したいファイルやディレクトリ名を書きます。
すると `git status` や `git add .` しても無視されるようになります。
すでに追加してしまったものに関しては、後述の方法で削除する必要があるようです。

via [git/無視するファイルを指定する方法(.gitignore について) &#8211; TOBY SOFT wiki](<http://tobysoft.net/wiki/index.php?git%2F%CC%B5%BB%EB%A4%B9%A4%EB%A5%D5%A5%A1%A5%A4%A5%EB%A4%F2%BB%D8%C4%EA%A4%B9%A4%EB%CA%FD%CB%A1(.gitignore%A4%CB%A4%C4%A4%A4%A4%C6)>)
via [gitignore](http://www.kernel.org/pub/software/scm/git/docs/gitignore.html "5")

## 削除

`svn delete` のようなことをするには `git rm hoge` 。
ディレクトリを消すには @git rm -r hoge@。

## なかったことにする

`git log` で戻りたいコミットの ID をチェック。
`git revert --hard commit_id`

via [FAQ/Git – CodeRepos::Share – Trac](http://bulkya.blogdb.jp/share/wiki/FAQ/Git#%E5%85%83%E3%81%AB%E6%88%BB%E3%81%99%E3%82%B3%E3%83%9E%E3%83%B3%E3%83%89)
