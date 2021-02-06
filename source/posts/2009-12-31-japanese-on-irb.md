---
title: "irb で日本語表示"
categories:
lang: ja
---

```
$irb
irb(main):001:0>puts "あああ"
"\343\201\202\343\201\202\343\201\202"
=> nil
```

上の例のように、日本語出力が読めない問題。

\$KCODE に使用中のターミナルの文字コードを設定すれば良いようです。
UTF-8 なら `$KCODE = 'u'` 、EUC-JP なら `$KCODE = 'e'` など。
irb コマンドのオプションでも指定できます。
`irb -Ku` とか `irb -Ke` とか。

via [irb で日本語出来た &#8211; 只今 Ruby 勉強中 &#8211; Rubyist](http://rubyist.g.hatena.ne.jp/gaba/20060702/p6)
