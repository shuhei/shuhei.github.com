---
title: "Color prompt by exit code"
tags: [Bash]
---

The idea of customizing bash prompt hooked me a few months ago. I tried a few crazy things like [showing random emojis](https://github.com/shuhei/dotfiles/commit/a45d8c88d4c02737dad397b56624895bb715f5b5) and finally settled down with just showing the current directory, git branch and status.

At [Tokyo Node Gakuen #18](http://nodejs.connpass.com/event/20646/) on October 8th, [@yosuke_furukawa](https://twitter.com/yosuke_furukawa) [talked about Node.js v4.0](https://speakerdeck.com/yosuke_furukawa/node-dot-js-v4-falsehua-number-tng18). Aside from the well-organized and informative talk, I found another interesting thing at his demo. His terminal prompt *turned red when a command failed*.

It looked pretty and useful. So I emulated it.

![Changing prompt color ](/images/prompt-exit-code.gif)

The code in `.bash_profile` is pretty straightforward. It changes the prompt color depending on whether the exit code is 0 or not. The only one trick is to capture the exit code at the very first line of the prompt command to prevent it from being changed in prior lines.

```sh
# Colors
light_green="\[\e[1;32m\]"
light_red="\[\e[1;31m\]"
yellow="\[\e[0;33m\]"
gray="\[\e[0;37m\]"
reset="\[\e[m\]"

# Customize prompt
prompt_command() {
  local status="$?"
  local status_color=""
  if [ $status != 0 ]; then
    status_color=$light_red
  else
    status_color=$light_green
  fi
  export PS1="[${yellow}\w${reset}]${gray}$(__git_ps1)${reset} ${status_color}λ${reset} "
}
export GIT_PS1_SHOWDIRTYSTATE=1
export PROMPT_COMMAND=prompt_commandsh
```

One of the advantages of attending real events over just browsing slides online is being able to take a peek of other people's dev environments. Looking forward to seeing more cool stuff on upcoming events like [Tokyo Node Fest 2015](http://nodefest.jp/2015/).
