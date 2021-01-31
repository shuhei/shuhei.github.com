---
layout: post
title: "Wordpress で Out of memory"
published: true
date: 2010-06-01
comments: true
tags:
tags: []
---

このブログは自宅サーバで運用しているのですが、5 月の頭、そして今日とサーバが応答しなくなっています。
再起動するとほぼ治るのですが、wp_options テーブルが少し壊れていたり。
syslog を見ると Out of memory で kernel が apache2 を kill している様子。
運用しているのはほとんど Wordpress だけなので、Wordpress が原因のはず。

積んでるメモリはたった 512MB。
人間様のアクセス数はあまりないのですが、検索エンジンのクローラは人並みに来ています。
おそらく、クローラのアクセスに耐えられなくなるのでしょう。

定期的な再起動、Apache や PHP の設定、MySQL のクエリキャッシュやメモリ使用量の設定など、対策はいろいろありそうですが、とりあえず今回は楽をして Wordpress のキャッシュプラグイン [WP Super Cache](http://wordpress.org/extend/plugins/wp-super-cache/) を入れて様子を見ることにしました。
&#8220;Super&#8221; Cache とはなかなかの名前です。
インストールはとても簡単。

さて、一ヶ月後どうなることやら。
