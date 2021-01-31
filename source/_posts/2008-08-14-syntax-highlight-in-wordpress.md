---
layout: post
title: "Wordpress でコードのシンタックスハイライト"
published: true
date: 2008-08-14
comments: true
tags:
tags: [Wordpress]
---

Wordpress でコードのシンタックスハイライﾄをしてくれるプラグインを入れてみました。
[WordPress › SyntaxHighlighter « WordPress Plugins](http://wordpress.org/extend/plugins/syntaxhighlighter/)

デフォルトでサポートされているのが以下。

- C++
- C#
- CSS
- Delphi
- Java
- Javascript
- PHP
- Python
- Ruby
- Sql
- VB
- XML/HTML

これに加えて、Actionscript3、MXML、Perl、bash も足しました。

以下、AS3 でテスト。

```
[sourcecode language='Actionscript']package
{
	import flash.display.Sprite;

	/**
	 * Test class.
	 */
	public class Test extends Sprite
	{
		/**
		 * @private
		 */
		private var _test:Sprite;

		/*
		 * Constructor.
		 */
		public function Test()
		{
			_test = new Sprite();
			_test.graphics.beginFill(0);
			_test.graphics.drawRect(0, 0, stage.stageWidth / 2, stage.stageHeight / 2);
			_test.graphics.endFill();
			addChild(_test);
		}
	}
}[/sourcecode]
```

## 参考 URL

- [Mj-site Blog » wordpress に AS3/MXML のコードハイライトプラグインを導入](http://blog.mj-site.net/2008/01/wordpress%E3%81%ABas3mxml%E3%81%AE%E3%82%B3%E3%83%BC%E3%83%89%E3%83%8F%E3%82%A4%E3%83%A9%E3%82%A4%E3%83%88%E3%83%97%E3%83%A9%E3%82%B0%E3%82%A4%E3%83%B3%E3%82%92%E5%B0%8E%E5%85%A5.html)
- [Languages &#8211; syntaxhighlighter &#8211; Google Code &#8211; List of supported languages.](http://code.google.com/p/syntaxhighlighter/wiki/Languages)

## <ins>追記</ins>

<ins>SyntaxHighlighter プラグインのかわりに Google Code Prettify を使うことにしたため、上のサンプルは正しく表示されません。</ins>
