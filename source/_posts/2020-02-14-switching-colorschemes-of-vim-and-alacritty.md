---
layout: post
title: Switching color schemes of Vim and Alacritty
date: 2020-02-14
tags: [Vim]
---

I like fountain pens and good notebooks. They spark joy when I write on paper. Computer terminals are like stationery. A good terminal setup makes it fun to work with computers. Here is how I improved colors on my terminal and made it easy to switch them depending on the time and the mood.

![Ayu Light for Vim and Alacritty](/images/light-terminal.png)

## Using official color schemes

I have been using Dracula color scheme on Vim and Alacritty for a while. I liked the colors, but I had a small problem with it on Vim. The pop-up of `coc.nvim` had the same color as the background color, and it was hard to distinguish a pop-up and the background.

![dracula from flazz/vim-colorschemes](/images/vim-dracula-old.png)

I was using Dracula from [vim-colorschemes](https://github.com/flazz/vim-colorschemes), which hadn't been updated for three years. I tried [the official Dracula color scheme for Vim](https://github.com/dracula/vim). It had a different background color for pop-ups! Yes, it's subtle, but now I can distinguish pop-ups from the background.

![dracula from dracula/vim](/images/vim-dracula-official.png)

[vim-colorschemes](https://github.com/flazz/vim-colorschemes) is a great way to try out different color schemes. You can get a random color scheme by `:colorscheme random`. But once you pick a few favorite ones, it's worth checking if they have official color schemes that are likely to be more maintained.

The same goes for Alacritty. I was using the Dracula color scheme that I converted with [my tool](https://github.com/shuhei/colortty) from [iTerm2-Color-Schemes](https://github.com/mbadolato/iTerm2-Color-Schemes) for Alacritty. Dracula has [its official Alacritty theme](https://github.com/dracula/alacritty), and it looks better!

## termguicolors

I started trying other color schemes and found Vim's `termguicolors` option in [ayu-vim](https://github.com/ayu-theme/ayu-vim)'s README. It enables true colors (24-bit colors) instead of 256 colors (8-bit).

```vim
if has('termguicolors')
  set termguicolors
endif
```

I turned it on, and the colors looked gorgeous! Before learning about `termguicolors`, I had tried light color schemes like Ayu Light and given up because of too low contrast (left in the following image). With `termguicolors`, light color schemes became finally usable!

![ayu light in 256 colors and true colors](/images/vim-light-colorscheme.png)

## Switching color schemes

After trying dozens of color schemes, I picked the following:

- [Ayu](https://github.com/ayu-theme/ayu-vim) Light: Good in the morning or at a place with natural light.
- [Pink Moon](https://github.com/sts10/vim-pink-moon)
- [Nord](https://github.com/arcticicestudio/nord-vim): Low-contrast theme. Good in the night.

I started switching color schemes depending on the time and the mood and bumped into a couple of issues. It was tedious to update the color schemes of Vim and Alacritty together. Also, I manage my `.alacritty.yml` and `.vimrc` in a git repository. It was annoying that the repository had unstaged changes every time I switched color schemes.

## Solution

### Alacritty

I decided to remove `.alacritty.yml` from the git repository and generate it out of a base template and color scheme files. Once I prepared a YAML file for each color scheme, it was quite easy with a one-liner.

```sh
cat alacritty/base.yml alacritty/${color}.yml > .alacritty.yml
```

### Vim

I could have generated `.vimrc`, but it felt weird because VimScript is a programming language. Instead of generating the whole `.vimrc`, I decided to generate a color scheme file `.vim/color.vim`, which is in `.gitignore`

```sh
echo 'let ayucolor="light"\ncolorscheme ayu' > ~/.vim/color.vim
```

and load it from `.vimrc`.

```vim
let color_path = expand('~/.vim/color.vim')
if filereadable(color_path)
  exec 'source' color_path
else
  " Default color scheme
  colorscheme pink-moon
endif
```

### Putting them together

Then, I created a shell script named `colorscheme` to switch color schemes of Vim and Alacritty together.

```sh
#!/bin/sh

color=$1
dotfiles=~/dotfiles
alacritty=${dotfiles}/alacritty

configure_alacritty() {
  cat ${alacritty}/base.yml ${alacritty}/${color}.yml > ${dotfiles}/.alacritty.yml
}

configure_vim() {
  echo $1 > ${dotfiles}/.vim/color.vim
}

case $color in
  dracula)
    configure_alacritty
    configure_vim 'colorscheme dracula'
    ;;
  nord)
    configure_alacritty
    configure_vim 'colorscheme nord'
    ;;
  pink-moon)
    configure_alacritty
    configure_vim 'colorscheme pink-moon'
    ;;
  ayu-light)
    configure_alacritty
    configure_vim 'let ayucolor="light"\ncolorscheme ayu'
    ;;
  *)
    echo "Supported colorschemes: dracula, nord, pink-moon, ayu-light"
    exit 1
    ;;
esac
```

Now I can switch color schemes with only one command! (I still need to restart/reload open Vim sessions, but I can live with it.)

```sh
colorscheme ayu-light
colorscheme nord
```

If you are curious about the full setup, check out [my dotfiles repo](https://github.com/shuhei/dotfiles).

## Summary

- Official color schemes may have more features than color scheme bundles
- Enable `termguicolors` on Vim
- Switch color schemes with a command!
