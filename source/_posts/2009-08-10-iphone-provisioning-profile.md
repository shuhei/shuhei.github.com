---
layout: post
title: "iPhone Provisioning Profile"
published: true
date: 2009-08-10
comments: true
tags: [iPhone 開発]
---

Provisioning Profile というやつがうまくできなくて、しばらく実機テストができませんでした。症状は、Provisioning Profile を作っても、Xcode のオーガナイザで「合致する証明書がないよ」と言われてしまうというもの。
改めて Apple Developer Connection の How-to ビデオを見て謎が解けました。証明書を作るときの手順に間違いがあったようです。

キーチェーンアクセス &#8594; 証明書アシスタント -> 認証局に証明書を要求&#8230; で出てくるダイアログで **鍵ペア情報を指定** というチェックボックスにチェックしていなかったのが原因のようでした。

たしか参考にした第三者のサイトのスクリーンショットで、ここにチェックが入っていなかったためそのままにしていたのです。困った時は公式ページ、という教訓ですね。
