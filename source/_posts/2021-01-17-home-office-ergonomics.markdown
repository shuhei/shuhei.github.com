---
layout: post
title: Things I wish I knew about home office ergonomics
date: 2021-01-17 15:05
comments: true
categories: []
---

![My current setup](/images/2021-desk-front.jpg)

Here are some tips that I learned through my own mistakes. I'm not an expert, and I know I'm late to the train. But I hope you find some of the tips useful!

## Start from your body

Find furniture and equipment that fit your body. Not the other way around. I made a mistake on it when I bought my standing desk.

To have a good posture, check the following requirements:

- Chair: Your feet should rest flat on the floor when you sit deep.
- Desk: Your elbows should be at 90 degrees or more when you type on your keyboard.
- Monitor: Your monitor's top edge should be around your eye-level.

These three constraints define the ideal sizes and positions of your chair, desktop, and monitor.

Besides that, you can find tons of resources on the internet if you search for _office ergonomics_. I found [the CUErgo website](http://ergo.human.cornell.edu/ergoguide.html) particularly informative.

## Chair

Your feet should rest flat on the floor when you sit deep. It's not hard to achieve because most office chairs are height-adjustable. But pay attention to the range of the seat level before you buy one.

### Good chair is worth your money

When I started working from home, I ordered the cheapest chair in stock at the time to satisfy my minimum needs. The chair looked OK, but its seat was too stiff. I nearly got hemorrhoids after a few weeks. I had to buy a donut-shaped seat cushion to get around the issue. But it didn't support my weight well and caused back pain.

Eventually, I decided to go with Aeron Chair Remastered, and I love it. It's not cheap, but it's much better than getting health problems.

## Desk

Your elbows should be at 90 degrees or more when you type on your keyboard. This arrangement requires careful planning. Few desks are height adjustable. Even adjustable desks have their minimum/maximum heights. If you can't get a desk of your perfect height, you can a keyboard tray to lower your keyboard or footrest to elevate yourself.

### Check the minimum height before buying a standing desk

I bought a standing desk, Flexispot E1, because I saw Flexispot on many blog posts in Japan and E1 was the most affordable one. It turned out that its minimum height 71 cm was too high for me. It took me a while to realize it because it's a _standing_ desk. More expensive models of Flexispot have lower minimum heights. For example, E5 can go down to 62 cm.

To work around the issue, I ordered a keyboard tray from Flexispot. The keyboard tray lowered the position of my keyboard and created more space on my desktop. I was happy that I was able to open a book between my keyboard and monitor. But the keyboard tray came with its problems. Typing hard on it shook the desk itself. It revealed the desk's instability. On top of that, the tray was unstable by itself because its screws were quite loose.

A good side effect was that I stopped resting my palms on wrist rests when I type. It was advice from the CUErgo website and an attempt to reduce the wobble of my desk and monitor. Now my monitor doesn't wobble and I can type faster.

### Stability matters

If you are getting a standing desk, get a stable one!

Stability is especially important if you use a big monitor and a monitor arm. I tried a 32-inch monitor once with a monitor arm and had to return it because it wobbled too much on the standing desk.

[btod.com has stability reviews of standing desks.](https://www.btod.com/blog/wobblemeter-results/)

If I buy a standing desk again, I would try IKEA's Idasen.

## Monitor

I'm using a 27-inch QHD monitor now after trying 24-inch and 32-inch. 32-inch was too big for me.

### Monitor height

Your monitor's top edge should be around your eye-level. Usually, the built-in stands of regular monitors don't go high enough. A stack of books, a monitor stand, or a monitor arm elevate your monitor. If you use a keyboard tray, you need less monitor elevation because you can keep your desktop higher.

You should check whether your setup can satisfy your monitor's perfect height before buying anything. If you are getting a monitor arm, you may want to check the relative position of your monitor's VESA mount to its top. Not all monitors have their VESA mounts at their center.

I'm using Flo from Colebrook Bosson Saunders. I'm satisfied with the beautiful monitor arm so far. Its maximum height is just enough for my eye-level. You may need a more robust one if you need more height or a bigger monitor.

## Inside your screen

You don't need to fill your screen with windows. My neck hurts if I stare at a corner of my screen for a long time. But I often found myself in this neck-bending situation. It helps if you keep your working area at the top center of your screen.

I stopped using applications in full screen or multi-window layout. I put my browser window in the half-width of my screen and put it at the center. Instead of showing multiple windows, I keep only one window at a time and switch windows with a keyboard shortcut. This single-window policy allows me to always look in front of me and focus on one thing at a time.

![One window at a time](/images/one-window.png)

### Vim

[Goyo](https://github.com/junegunn/goyo.vim) is a Vim plugin that creates a focus mode. The plugin hides non-essential elements and places the text at the center. The focus mode helps you not only focus, but also keep you face the center of the screen.

If Goyo provides horizontal adjustment, `z<CR>` provides vertical adjustment. The normal-mode command brings the current line to the top of your screen. It helps you keep your neck straight.

![Distraction-free Vim](/images/distraction-free-vim.png)

### Terminal

Can we create the Goyo-like focus mode outside of Vim? [This cool trick on SuperUser](https://superuser.com/questions/1261810/creating-a-focus-mode-for-tmux-one-centered-pane-flanked-by-two-blank-panes) allows you to create a focus mode on tmux. You can also move up your eyes to the top of your screen by `clear` on your terminal.

## Move!

Even with all of the above, my body doesn't feel well if I stay in front of my computer all day. I go out for a walk every day, and it makes a difference. Ergonomic setup doesn't mean you can work all day.
