---
layout: post
title: "How to use ofxUI"
published: true
date: 2012-04-02 20:13
comments: true
tags: 
categories: openFrameworks
---

{% vimeo 36385123 800 600 %}

[ofxUI: A User Interface Addon for OF](http://www.syedrezaali.com/blog/?p=2172) を使うと openFrameworks に [ofxControlPanel](https://github.com/ofTheo/ofxControlPanel) よりもちょっとかっこいい UI を追加することができます。[github のページ](https://github.com/rezaali/ofxUI) の Readme を超訳してみました。

1\. [ダウンロードページ](https://github.com/rezaali/ofxUI/downloads)から ofxUI をダウンロード。中の `src` を `of/addons` の中に移して、名前を `ofxUI` にします。残りは `of/apps` に移して `ofxUIExamples` などとします。すると以下のようなファイル構成になります。

        of
        |--- addons
        |    |--- ofxUI
        |         |--- ofxUI.h
        |         |--- ...
        |
        |--- apps
        |    |--- addonExamples
        |    |--- examples
        |    |--- myapps
        |    |--- ofxUIExamples
        |         |--- example-ofxUIAllWidgets
        |         |--- ...
        |--- …

2\. `of/apps/examples/emptyExample` を `of/apps/myapps` 以下にコピーして新しいプロジェクトを作ります。

3\. 新しく作ったプロジェクトを Xcode で開きます。

4\. Xcode の左側の `addons` のところに Finder から `of/addons/ofxUI` をドラッグアンドドロップします。

5\. "Choose options for adding these files" と聞かれたら、何もせず "finish" を押します。`of/addons/ofxXmlSettings` も同様に Xcode の `addons` フォルダに追加。このアドオンは XML ファイルに設定を保存して読み出すのに使われます。

6\. Finder で `of/apps/ofxUIExamples/example-ofxUIAllWidgets/bin/data/GUI` をコピーし、プロジェクトの `bin/data` に入れます。

7\. アプリのヘッダファイル（testApp.h）で "ofxUI.h" を include します。

8\. ヘッダに続けて以下の変数と関数を追加。

```cpp
ofxUICanvas *gui;

void exit();
void guiEvent(ofxUIEventArgs &e);
```

9\. 実装ファイルにメソッドを追加します。

```cpp
void testApp::exit()
{

}

void testApp::guiEvent(ofxUIEventArgs &e)
{

}
```

10\. `setup()` の中で初期化。引数は GUI の左上の点の座標と幅と高さです。

```cpp
gui = new ofxUICanvas(0,0,320,320);          //ofxUICanvas(float x, float y, float width, float height)         
```

11\. `exit()` はアプリの終了前に呼ばれます。ここでは設定の保存と gui オブジェクトの破棄を行います（変数がポインタなので参照先を解放しないとメモリリーク）。

```cpp
void testApp::exit()
{
  gui->saveSettings("GUI/guiSettings.xml");    
  delete gui;
}
```

12\. GUI にウィジェット（UI 部品のこと）を追加する。最後から二番目の行は、リスナー／コールバックを追加することで、ウィジェットがユーザに操作されたときに何をすればいいか GUI に教えています。よくわからなくても気にしない。また、最後の行は GUI に XML に保存された設定を読み込んでいます。ファイルがなければ、ウィジェットのデフォルトの値が使用されます。

```cpp
gui->addWidgetDown(new ofxUILabel("OFXUI TUTORIAL", OFX_UI_FONT_LARGE));
gui->addWidgetDown(new ofxUISlider(304,16,0.0,255.0,100.0,"BACKGROUND VALUE"));
ofAddListener(gui->newGUIEvent, this, &testApp::guiEvent);
gui->loadSettings("GUI/guiSettings.xml");
```

13\. ユーザが UI を操作したときに呼ばれます。操作されたウィジェットに関する処理を書きましょう。

```cpp
void testApp::guiEvent(ofxUIEventArgs &e)
{
    if(e.widget->getName() == "BACKGROUND VALUE")    
    {
        ofxUISlider *slider = (ofxUISlider *) e.widget;   
        ofBackground(slider->getScaledValue());
    }  
}
```

14\. フルスクリーンモードとウィンドウモードを切り替えるためにトグルを追加します。`setup()` メソッドの中で他のウィジェットの後に以下を追加。もしこれをもうひとつの `addWidgetDown` の呼び出しの前に書けば、トグルはスライダーの上に置かれます。

```cpp
gui->addWidgetDown(new ofxUIToggle(32, 32, false, "FULLSCREEN"));
```

15\. "FULLSCREEN" トグルウィジェットに対応するため、`guiEvent` メソッドにもう一つ機能を追加します。結局のところ、こんな風に見えるはず。

```cpp
void testApp::guiEvent(ofxUIEventArgs &e)
{
    if(e.widget->getName() == "BACKGROUND VALUE")
    {
        ofxUISlider *slider = (ofxUISlider *) e.widget;   
        ofBackground(slider->getScaledValue());
    }
    else if(e.widget->getName() == "FULLSCREEN")
    {
        ofxUIToggle *toggle = (ofxUIToggle *) e.widget;
        ofSetFullscreen(toggle->getValue());
    }   
}
```

こんな感じで他のウィジェットを置いて操作できるようにすることができます。

サンプルコードを見れば、もっと複雑なウィジェットの使い方をしらべることもできます。ここで紹介したコードもサンプルコードの中に入っているので、わからなくなったら見てみとよいでしょう。

