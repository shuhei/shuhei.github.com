---
layout: post
title: Winter Terminal (mostly Vim) Cleaning
date: 2019-12-31 15:20
comments: true
categories: [Vim]
---

In December, I spent some time cleaning up my terminal setup. Dust had piled up in a year, and my terminal was getting slower. It was time to dust off.

Here are highlights of [the changes](https://github.com/shuhei/dotfiles/compare/d5fa68a7514b040d0d19466ee85ebfbeb30b1d37...a8344b9d204af70f36ac8505df62425e87c5273d).

## Faster Text Rendering

I noticed a non-negligible lag when I was editing JavaScript/TypeScript in Neovim. At first, I thought some Vim plugins caused it. But it was not true. Not only editing was slow, but also scrolling was slow. Text rendering itself was the problem.

I opened files of different types in Vim's vertical split and `less` in tmux's vertical split. And I scrolled down and (subjectively) evaluated the smoothness of scrolling.

It turned out that Vim was not the problem. With vertical splits of tmux, even `less` command was slow to scroll. Regardless of Vim or tmux, text rendering in vertical splits was slow on iTerm2. In retrospect, it makes sense because iTerm2 doesn't know about vertical split by Vim or tmux and can't limit rendering updates to the changed pane. [iTerm2's tmux integration](https://www.iterm2.com/documentation-tmux-integration.html) may have helped, but I didn't try that.

I tried [Alacritty](https://github.com/jwilm/alacritty), and it was much faster! I had been using Alacritty before but switched back to iTerm2 for font ligatures. Now I didn't care much about font ligatures—ligatures look pretty, but glyphs for `!=` and `!==` confused me in JavaScript. So I switched to Alacritty again.

Also, I stopped using [flatlandia](https://github.com/jordwalke/flatlandia) color scheme in Vim, and it improved the rendering speed a bit. I didn't dig into why, though.

## fzf.vim

[fzf.vim](https://github.com/junegunn/fzf.vim) was a life changer. It provides a blazing fast incremental search for almost anything. I use it for file names (instead of [ctrlp.vim](https://github.com/kien/ctrlp.vim)), commit history and grep. Especially, incremental grep with a preview is amazing.

## More Vim Cleaning

- Started using [ale](https://github.com/dense-analysis/ale) as a [Language Server Protocol](https://microsoft.github.io/language-server-protocol/) client. I was using ale for linting and fixing, and [LanguageClient-neovim](https://github.com/autozimu/LanguageClient-neovim) for LSP features. LanguageClient-neovim also shows a quickfix window when a file contains syntax errors and was conflicting with ale. I learned that ale supported LSP as well and made it handle LSP too.
  - **Update on Jan 3, 2019:** I started using [coc.nvim](https://github.com/neoclide/coc.nvim) instead of ale and deoplete.nvim for autocomplete, linting, fixint and LSP features. It makes Vim an IDE. Simply incredible.
- Configured Vim to open `:help` in a vertical split. `:help` is a valuable resource when configuring Vim. The problem for me was that Vim opens help in a horizontal split by default. Opening help in a vertical split makes it much easier to read.

  ```vim
  autocmd FileType help wincmd H
  ```

- Sorted out JavaScript/JSX/TypeScript syntax highlighting. Vim sets `javascriptreact` to `.jsx` and `typescriptreact` to `.tsx` by default. But those file types don't work well with the plugin ecosystem because plugins for `javascript`/`typescript` file types don't work with `javascriptreact`/`typescriptreact` and popular JSX/TSX plugins use `javascript.jsx` and `typescript.tsx`.

  ```vim
  autocmd BufRead,BufNewFile *.jsx set filetype=javascript.jsx
  autocmd BufRead,BufNewFile *.tsx set filetype=typescript.tsx
  ```

- Stopped unnecessarily lazy-loading Vim plugins with [dein.vim](https://github.com/Shougo/dein.vim). I had configured file-type-specific plugins as lazy plugins of dein.vim without understanding much. The truth was that lazy plugins are meaningful only for plugins with `plugin` directory. Most of the file-type-specific plugins don't have `plugin` directory and are lazily loaded by default with `ftdetect` and `ftplugin`. `:echo dein#check_lazy_plugins()` shows those plugins that are ill-configured. I finally learned [what those plugin directories do](https://learnvimscriptthehardway.stevelosh.com/chapters/42.html) after using Vim for several years...
- Reviewed key mappings and removed waiting time by avoiding mappings that prefixed other mappings. For example, I had mappings of `,g` and `,gr`. `,g` was slow because Vim had to wait for a while to determine it was `,g` or `,gr`.
- Tried Vim 8 but switched back to Neovim. Vim 8 worked well, but tiny details looked smoother in Neovim. For example, when syntax highlighting hangs up, Vim 8 hangs up while Neovim disables syntax highlighting and goes on.
- Started documentation of my setup. I keep forgetting key mappings, useful plugins that I occasionally use, how things are set up, etc.
