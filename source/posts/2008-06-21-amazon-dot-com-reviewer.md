---
title: "Amazon.co.jp の洋書レビューを Amazon.com で見るための Greasemonkey"
tags: [Greasemonkey]
---

Amazon.co.jp で洋書を見ると、レビューがほとんどありません。
一方、Amazon.com に行けばレビューがたくさんあります。
ですが同じ本のページを探すのに、 ISBN をコピペしたり検索し直したりするのは、ちょっとした手間ですね。

そこで、Greasemonkey の user script を書いてみました。

本の題名のすぐ下に、リンクができます。
amazon.co.jp からは amazon.com の、amazon.com からは amazon.co.jp の、それぞれ同じ本のページへのリンクです。
洋書のレビューを amazon.com で探したり、また amazon.com で見つけた本を amazon.co.jp で買う際に地味に便利です。

amazondotcomreviewer.user.js

```js
// ==UserScript==
// @name           AmazonDotComReviewer 0.1
// @namespace      http://www.7to3.net
// @description    Make link between amazon.com and amazon.co.jp
// @include        http://*.amazon.*
// ==/UserScript==

(function() {
  var isbnmatch = window.location.href.match(
    /amazon\.(com|co\.jp)\/.*\/([0-1][0-9A-Z]{9})\//
  );
  var header = document.getElementById("btAsinTitle");

  if (header && isbnmatch) {
    domain = isbnmatch[1] === "com" ? "co.jp" : "com";
    isbn = isbnmatch[2];

    var uslink = document.createElement("a");
    uslink.setAttribute(
      "href",
      "http://www.amazon." + domain + "/o/ASIN/" + isbn + "/"
    );
    uslink.setAttribute("title", "The same book at amazon." + domain);
    uslink.innerHTML = "<br />&#187; Check also amazon." + domain + "!";

    header.insertBefore(uslink, header.firstChild.nextSibling);
  }
  return false;
})();
```
