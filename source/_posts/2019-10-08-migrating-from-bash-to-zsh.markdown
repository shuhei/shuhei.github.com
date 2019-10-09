---
layout: post
title: Migrating from bash to zsh
date: 2019-10-09 23:20
comments: false
categories: [zsh]
---

A few days ago, I updated my Macbook Air to macOS Catalina. The installation took some time, but it was done when I got up the next morning. The applications that I use seemed to work fine on Catalina. But bash started complaining at the beginning of new sessions.

```console
The default interactive shell is now zsh.
To update your account to use zsh, please run `chsh -s /bin/zsh`.
For more details, please visit https://support.apple.com/kb/HT208050.
```

I asked whether I should migrate to zsh on Twitter. Three people said "yes" as if it was common sense. OK, let's migrate.

## Changing the default shell of tmux

First, I followed the instruction from Apple.

```sh
chsh -s /bin/zsh
```

However, it didn't change the default shell of tmux. I restarted sessions in tmux, and restarted iTerm 2 and the tmux server. But tmux still started bash sessions. Why?

I googled. There was [a Q&A for the exact problem](https://superuser.com/questions/253786/how-can-i-make-tmux-use-my-default-shell) on superuser. The `default-command` option of tmux is the default shell. I had a hardcoded `bash` there! By the way, `reattach-to-user-namespace` is for sharing Mac's clipboard with tmux.

```
set-option -g default-command "reattach-to-user-namespace -l bash"
```

I updated it with `SHELL` environment variable so that I can migrate to any shell in the future!

```
set-option -g default-command "reattach-to-user-namespace -l ${SHELL}"
```

## Command prompt

Then I installed [oh-my-zsh](https://github.com/robbyrussell/oh-my-zsh) and copied my `.bash_profile` to `.zshrc`. Most of the content of my `.bash_profile` were aliases and `PATH`s. They worked fine on zsh too.

But zsh has a different format for prompt. oh-my-zsh provides a lot of nice prompt themes, but I wanted to keep using the one that I had configured with bash. Let's migrate it to zsh.

oh-my-zsh has a directory for custom themes (`.oh-my-zsh/custom/themes`). I moved the `custom` directory to [my dotfiles repo](https://github.com/shuhei/dotfiles) and symlinked it so that I can manage my custom theme with Git without forking oh-my-zsh itself.

Eventually, I came up with a theme like this:

![my custom theme](/images/zsh_prompt.png)

```bash
ZSH_THEME_GIT_PROMPT_PREFIX="%{$fg[white]%}("
ZSH_THEME_GIT_PROMPT_SUFFIX="%{$fg[white]%})%{$reset_color%}"
ZSH_THEME_GIT_PROMPT_DIRTY="*"
ZSH_THEME_GIT_PROMPT_CLEAN=""

# %~ is the current working directory relative to the home directory
PROMPT='[$FG[228]%~%{$reset_color%}]'
PROMPT+=' $(git_prompt_info)'
PROMPT+=' %(?.$FG[154].$FG[009])€%{$reset_color%} '
```

Each oh-my-zsh theme defines a variable called `PROMPT`. Aside from [its syntax](http://zsh.sourceforge.net/Doc/Release/Prompt-Expansion.html), I was not sure how and when `PROMPT` was evaluated. In hindsight, it is a string that is built once when a session starts or `source .zshrc`. Every time a prompt is shown, `PROMPT` is evaluated, meaning escapes (starting with `%`) and variables in it are expanded.

### Colors

At the beginning, I was baffled by how to specify colors. For example, the following `PROMPT` shows "some red text" in red.

```bash
PROMPT='%{$fg[red]%}some red text%{$reset_color%}'
```

`$fg[red]` has the code that makes its following text red. `$reset_color` has the code that resets the color. The tricky part is that these codes need to be surrounded by `%{` and `%}` in `PROMPT`.

[zsh provides handy variables for colors](https://github.com/zsh-users/zsh/blob/243e46998eb29665ec345e531b2d1bb6921ed578/Functions/Misc/colors#L97-L117).

- `reset_color`
- `fg`, `fg_bold`, `fg_no_bold`: They are associative arrays (similar to JavaScript objects).
- `bg`, `bg_bold`, `bg_no_bold`

Also, [oh-my-zsh provides 256 colors](https://github.com/robbyrussell/oh-my-zsh/blob/b09aed9cc7e2099f3e7f2aa2632660bc510f3e35/lib/spectrum.zsh).

- `FX`: This has codes for text effects like `FX[underline]`.
- `FG`: 256 colors for foreground like `FG[102]`.
- `BG`: 256 colors for background like `BG[123]`.

`spectrum_ls` and `spectrum_bls` commands show you all the 256 colors! Note that values in `FX`, `FG` and `BG` are already surrounded by `%{` and `%}`, and we don't need to do it again.

We can examine those variables in the terminal.

```sh
echo "${fg[yellow]}hello${reset_color} ${bg[green]}world${reset_color}"

# `(kv)` extracts key values from an associative array.
echo ${(kv)fg}
echo ${(kv)FG}
```

### Exit code

With bash, [I had a trick to change the color of the prompt by the previous command's exit code](/blog/2015/10/18/color-prompt-by-exit-code/). How can I achieve this with zsh?

![Change color by exit code](/images/exit_code.png)

Surprisingly, [zsh prompt expression has a special syntax for switching prompt by exit code](https://stackoverflow.com/questions/4466245/customize-zshs-prompt-when-displaying-previous-command-exit-code). To be accurate, it's a combination of a ternary operator and `?` for exit code check.

```bash
# Shows "foo" if the exit code is 0 and "bar" if the exit code is non-zero.
%(?.foo.bar)
```

The following expression shows the Euro sign in green if the exit code is 0 and in red if the exit code is non-zero.

```bash
%(?.%{$fg[green]%}.%{$fg[red]%})€%{$reset_color%}
```

### Git info

`git_prompt_info()` function outputs git info such as the branch name and the state of the working tree (clean or dirty). We can customize its output by `ZSH_THEME_GIT_PROMPT_*` variables.

I wrote something like this:

```bash
ZSH_THEME_GIT_PROMPT_PREFIX="%{$fg[white]%}("
ZSH_THEME_GIT_PROMPT_SUFFIX="%{$fg[white]%})%{$reset_color%}"
ZSH_THEME_GIT_PROMPT_DIRTY="*"
ZSH_THEME_GIT_PROMPT_CLEAN=""

PROMPT="... $(git_prompt_info) ..."
```

I thought it was done and went back to work. But when I switched the git branch, the prompt stayed the same. Why? I googled again. There was [an issue](https://github.com/robbyrussell/oh-my-zsh/issues/4826) for the same problem. The `PROMPT` needs to be created with single quotes instead of double quotes so that dynamic parts are not evaluated when it's defined!

```bash
PROMPT='... $(git_prompt_info) ...'
```

## Conclusion

I have migrated my terminal from bash to zsh. My initial motivation was passive (Catalina deprecated bash), but it's always fun to try something new (to me). I'm looking forward to trying cool zsh plugins and tricks!
