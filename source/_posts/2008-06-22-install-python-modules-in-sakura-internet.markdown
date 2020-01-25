---
layout: post
title: "さくらのサーバに Python モジュールをインストール"
published: true
date: 2008-06-22 12:24
comments: true
tags:
categories: [Python, さくらインターネット]
---

さくらインターネットのレンタルサーバ（スタンダード）に、Python の外部モジュールを入れました。
インストール場所は、`$HOME/lib/python`に。

\$HOME/.cshrc で環境変数を設定。

```
 setenv PYTHONPATH $HOME/lib/python
```

ほとんどは、ダウンロードして展開したディレクトリの中で、下記で OK でした。

```
python setup.py install --home=~
```

今日インストールしたのは以下。

- Universal Feedparser
- Python Imaging Library
- Beautiful Soup
- IPython（モジュール？）
- MySQLdb
- ~NumPy~
- ~matplotlib~
- pydelicious
- Element Tree
