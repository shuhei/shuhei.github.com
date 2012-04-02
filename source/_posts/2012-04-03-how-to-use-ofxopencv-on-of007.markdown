---
layout: post
title: "How to use ofxOpenCv on of007"
published: true
date: 2012-04-03 00:36
comments: true
tags: 
categories: openFrameworks
---
ofxOpenCv を of007 で使うためのちょっとしたメモです。

1\. `addons` に `of/addons/ofxOpenCv` をドラッグ。`src` 以外は参照を消してしまう。

2\. Build Settings -> Linking -> Other Linker Flags に以下を設定。

        $(OF_PATH)/addons/ofxOpenCv/libs/opencv/lib/osx/opencv.a

3\. Build Settings -> Search Paths -> Header Search Paths に以下を設定。

        $(OF_PATH)/addons/ofxOpenCv/libs/opencv/include/opencv
        $(OF_PATH)/addons/ofxOpenCv/libs/opencv/include
        $(OF_PATH)/addons/ofxOpenCv/src

