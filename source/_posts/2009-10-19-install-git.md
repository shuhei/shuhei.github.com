---
layout: post
title: "git をインストール"
published: true
date: 2009-10-19
comments: true
tags:
categories: []
---

会社では構成管理に Subversion を使っています。
特に困っていることもないのですが、見識を広めるため家の MacBook に git を入れてみました。

[インストーラ](http://code.google.com/p/git-osx-installer/) もあるようですが、管理が楽そうな MacPorts を使用。

```
port search git
```

いろいろ出てきますが、git-core だけでよさそうです。

```
port variants git-core
```

でオプションが出てきます。
全部入りにしてみました。

```
sudo port install git-core +doc +gitweb +svn +bash_completion
```

何だか Perl5 のライブラリがたくさん入りました。
bash 補完は以下を.profile に貼付けると良いとのこと。

```
if [ -f /opt/local/etc/bash_completion ]; then
  . /opt/local/etc/bash_completion
fi
```

その後 [チュートリアル](http://www8.atwiki.jp/git_jp/pub/git-manual-jp/Documentation/gittutorial.html) を読んでいろいろ試してみました。branch が機能として統合されているのがいいですね。
branch については [アリスがチャレンジなコードを書く時、git branch をちゃんと理解したい！ &#8211; ザリガニが見ていた&#8230;。](http://d.hatena.ne.jp/zariganitosh/20080912/1221260782) がとても参考になりました。
