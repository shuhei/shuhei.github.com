---
layout: post
title: Migrating from bash to zsh
date: 2019-10-08 23:20
comments: true
categories: [Mac]
---

I updated my Macbook Air to macOS Catalina. The installation took some time, but it was done when I got up this morning. The applications that I use seemed to work fine on Catalina. But the shell started complaining.

```
The default interactive shell is now zsh.
To update your account to use zsh, please run `chsh -s /bin/zsh`.
For more details, please visit https://support.apple.com/kb/HT208050.
```

I asked whether I should migrate to zsh on Twitter. Three people said "yes" as if it were a common sense. OK, let's migrate.

## Changing the default shell of tmux

First, I followed the instruction from Apple.

```sh
chsh -s /bin/zsh
```

However, it didn't change the default shell of tmux. I restarted sessions in tmux, and restarted iTerm 2 and the tmux server. But tmux still started bash sessions. Why?

I googled. There was [a Q&A for the exact problem](https://superuser.com/questions/253786/how-can-i-make-tmux-use-my-default-shell) on superuser. Actually, I had written `bash` in `tmux.conf` to share Mac's clipboard with tmux.

```
set-option -g default-command "reattach-to-user-namespace -l bash"
```

I updated it so that I can migrate to any shell in the future!

```
set-option -g default-command "reattach-to-user-namespace -l ${SHELL}"
```

## Command prompt

Then I installed [oh-my-zsh](https://github.com/robbyrussell/oh-my-zsh) and copied my `.bash_profile` to `.zshrc`.

OK, zsh has a different format for prompt. oh-my-zsh provides a lot of nice propmt themes, but I wanted to keep using the one that I had configured with bash. Let's write one for zsh.

We can put custom themes at
`.oh-my-zsh/custom/themes`. I moved the `custom` directory to [my dotfiles repo](https://github.com/shuhei/dotfiles) and symlinked it so that I can manage my custom theme with Git without forking oh-my-zsh itself.

```
ZSH_THEME_GIT_PROMPT_PREFIX="%{$fg[white]%}("
ZSH_THEME_GIT_PROMPT_SUFFIX="%{$fg[white]%})%{$reset_color%}"
ZSH_THEME_GIT_PROMPT_DIRTY="*"
ZSH_THEME_GIT_PROMPT_CLEAN=""

# %~ is the current working directory relative to the home directory
PROMPT='[%{$FG[228]%}%~%{$reset_color%}]'
PROMPT+=' $(git_prompt_info)'
PROMPT+=' %(?.%{$FG[154]%}.%{$FG[005]%})€%{$reset_color%} '
```

## Colors

```
PROMPT="%{$fg[red]%}some red text%{$reset_color%}"
```

We can also use more specific colors by `$FG[123]` I used `spectrum_ls` command to check available color codes.

## Exit code

With bash, [I had a trick to change the color of the prompt by the previous command's exit code](http://localhost:4000/blog/2015/10/18/color-prompt-by-exit-code/). How can I do this with zsh?

![Change color by exit code](/images/exit_code.png)

Surprisingly, [zsh prompt expression has a special syntax for switching prompt by exit code](https://stackoverflow.com/questions/4466245/customize-zshs-prompt-when-displaying-previous-command-exit-code). To be accurate, it's a combination of a ternary operator and `?` for exit code check.

```
# Shows "foo" if the exit code is 0 and "bar" if the exit code is non-zero.
%(?.foo.bar)
```

The following expression shows the Euro sign in green if the exit code is 0 and in red if the exit code is non-zero.

```
%(?.%{$FG[154]%}.%{$FG[005]%})€%{$reset_color%}
```

## Git info

`git_prompt_info` function outputs git info such as the branch name and the state of the working tree (clean or dirty). We can customize its output by `ZSH_THEME_GIT_PROMPT_*` variables.

```
ZSH_THEME_GIT_PROMPT_PREFIX="%{$fg[white]%}("
ZSH_THEME_GIT_PROMPT_SUFFIX="%{$fg[white]%})%{$reset_color%}"
ZSH_THEME_GIT_PROMPT_DIRTY="*"
ZSH_THEME_GIT_PROMPT_CLEAN=""

PROMPT="... $(git_prompt_info) ..."
```

I thought it was done and went back to work. But when I switched git branch, the prompt stayed same. Why? I googled again. There was [an issue](https://github.com/robbyrussell/oh-my-zsh/issues/4826) for the exactly same problem. The `PROPMT` needs to be created with single quotes instead of double quotes so that dynamic parts are not evaluated when it's defined!

```
PROMPT='... $(git_prompt_info) ...'
```

## Evaluation of PROMPT

As a hindsight, now I can summarize how it works.

`PROPMT` is a string that is built only once when a session starts or `source .zshrc`. Every time a prompt is shown, the string is evaluated. Variables and commands in it are expanded.

http://zsh.sourceforge.net/Doc/Release/Prompt-Expansion.html

It's different from bash's [`PROMPT_COMMAND`](http://tldp.org/HOWTO/Bash-Prompt-HOWTO/x264.html), which is a function that is executed every time a prompt is shown.
