---
layout: post
title: "言語ごとに vim の設定を変える"
tags: [UNIX/LINUX]
---

例えば、普段はタブじゃなくてスペースでインデントしたいけど、C# の場合はタブがいい。そんな時に。

`~/.vimrc` の中で、

```
autocmd FileType cs setlocal noexpandtab
```

もっといろいろ書くときは `~/.vim/ftplugin/cs.vim` などに書くと良いとか。
