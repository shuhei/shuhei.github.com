---
layout: post
title: "Windows で grep"
date: 2010-02-17
tags: [Windows]
---

```
findstr /n /s /c:"hello world" sub_dir\*
```

これで subdir 以下の &#8220;hello world&#8221; を含むファイルと行を表示できます。
/n で行番号表示。/s は再帰的に。

```
findstr /n /s "hello world" sub_dir\*
```

とすると、&#8220;hello&#8221; と &#8220;world&#8221; の両方にマッチしてしまうので注意。

via [コマンドプロンプトで，暗記するべき１０の必須コマンド　　(前半) ファイル処理系 &#8211; 主に言語とシステム開発に関して](http://d.hatena.ne.jp/language_and_engineering/20081001/1222857265)
