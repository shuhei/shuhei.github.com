---
layout: post
title: "RVM で複数バージョンの Ruby を管理"
tags: []
---

1.8.7 と 1.9.1 など、複数の Ruby を共存させたい時があると思います。
自分でシンボリックリンクを切り替えて・・・とか考えましたが面倒くさい。
[Ruby Version Manager](http://rvm.beginrescueend.com/) という素晴らしいものがあるそうです。

- [RVM: Ruby Version Manager &#8211; Installing RVM](http://rvm.beginrescueend.com/rvm/install/)
- [rvm: 複数の Ruby を共存させる最新のやり方 &#8211; 床のトルストイ、ゲイとするとのこと](http://d.hatena.ne.jp/mirakui/20100502/1272849327)

を参考にインストール。
公式サイトの方に gem はおすすめできないと書いてあったので下記の方法で。

```sh
bash < <( curl http://rvm.beginrescueend.com/releases/rvm-install-latest )
```

した後 .bashrc の最後に以下を記載。

```sh
[[ -s $HOME/.rvm/scripts/rvm ]] && source $HOME/.rvm/scripts/rvm
```

これでターミナルを再起動すれば完了です。

```sh
rvm list known
```

とするとインストール可能なバージョンのリストを出力してくれます。
下記で 1.9.1 をインストール。

```sh
rvm install 1.9.1
```

irb, gem, rake なども一緒にインストールして管理してくれます。
1.8.7 系もインストール。

```sh
rvm install 1.8.7
```

使用する Ruby を変えるには・・・。

```sh
rvm use 1.8.7
```

情報を見るには下記。

```sh
rvm info 1.8.7
```

1.8.7 は現時点では p174 の模様。最新安定板は p249 のようなので、少し古いのかも。
1.8.7-head とすると head がとれますが、こちらは p294 と安定板ではない様子でした。
