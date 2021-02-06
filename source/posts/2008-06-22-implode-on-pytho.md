---
title: "Python で implode"
tags: [Python]
---

PHP などで、配列の要素をあいだに何を挟みながらくっつけて文字列にする関数 `implode`。

```php
$output = implode(",", $arr);
```

同じことをしようとすると、Python では、以下。

```py
output = ",".join(arr)
```

少し変態っぽいですね。