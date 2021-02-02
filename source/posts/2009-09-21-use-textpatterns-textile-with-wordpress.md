---
title: "Wordpress で Textpattern 相当の Textile を使う"
tags: [Wordpress]
---

以前 [Wordpress の Textile プラグイン](/blog/2009/08/02/wordpress-textile-plugin/) という記事で、Wordpress の Textile 対応について書きました。この時は満足の行く結果が得られませんでしたが、今回ついにまともに Textile 2 が使えるようにできました。

きっかけは、いくつかの簡易記法を選んで使えるというプラグイン [Text Control 2](http://wordpress.org/extend/plugins/text-control-2/) をふと思い立ってインストールしてみたこと。
このプラグインでも Textile 2 は文字化けするものの、Textile 1 は文字化けせず。つまり Textile 2 用のプラグラムに問題があるということです。
これを実績のある Textpattern の Textile モジュールに置き換えてみると上手く行きました。

## 手順

### classTextile.php の入手

Textpattern から `textpattern/lib/classTextile.php` を `wp-content/plugins/text-control-2/text-control/` に持ってきます。

### textile2.php ではなく classTextile.php を使うように

`wp-content/plugins/text-control-2/text-control.php` の 185 行目あたりを

```php
function tc_post_process($text, $do_text='', $do_char='') {
  if($do_text == 'textile2') {

    require_once('text-control/textile2.php');
    $t = new Textile();
    $text = $t->process($text);
```

から

```php
function tc_post_process($text, $do_text='', $do_char='') {
  if($do_text == 'textile2') {

    require_once('text-control/classTextile.php');
    $t = new Textile();
    $text = $t->TextileThis($text);
```

へ変更します。

## 結果

以上で、Wordpress でも Textpattern 相当の Textile が使えるようになります。
Google Code Prettify も、これまではいちいち HTML のタグで囲んでいたのが `pre(prettyprint)..` と書くだけで使えるようになりました。大変便利ですね。
