---
layout: post
title: "Freeze panes with CSS and a bit of JavaScript"
date: 2016-01-11 11:24
comments: true
categories: [CSS, JavaScript]
---

People want fixed-header table. It reminds you what the columns are while you scroll down the table. There are a bunch of fixed-header-table tutorials out there. But most of them kill one of the greatest features of HTML table. The automatic sizing of cells according to their contents. This is because they usually prepare separate `<table>`s for header and body.

Also, most of the tutorials only fix a header at the top. But my colleagues wanted more. They wanted to fix headers at the top and left. Just like [Microsoft Excel's Freeze Panes feature](http://www.gcflearnfree.org/excel2013/17). So what we want now is:

1. Automatic sizing of cells according to their contents
2. Freeze panes

We want to use only one `<table>` to easily achive the goal 1. But at the same time, we want to separate the movement of the headers from other cells to achieve the goal 2. Then [CSS3's `transform` property](https://developer.mozilla.org/en-US/docs/Web/CSS/transform) came to my mind. It allows you to transform **only rendering** of an element without interfering its sibling nodes.

So I gave it a shot and here's the result.

<a href="https://jsbin.com/katabi/edit" target="_blank">JS Bin on jsbin.com</a>

## transform: translate()

I used JavaScript to dynamically set `transform: translate(x, y);` to the header cells sending them back to the top/left edge of the container.

```js
container.addEventListener('scroll', function () {
  var x = container.scrollLeft;
  var y = container.scrollTop;

  leftHeaders.forEach(function (leftHeader) {
    leftHeader.style.transform = translate(x, 0);
  });
  topHeaders.forEach(function (topHeader, i) {
    if (i === 0) {
      topHeader.style.transform = translate(x, y);
    } else {
      topHeader.style.transform = translate(0, y);
    }
  });
});

function translate(x, y) {
  return 'translate(' + x + 'px, ' + y + 'px)';
}
```

## border-collapse: separate;

Another trick is `border-collapse: separate;`. We usually use `border-collapse: collapse;` for tables but it leaves borders behind the cells. With `border-collapse: collapse;`, we can make the borders transformed together with the header cells.

```css
table {
  border-collapse: separate;
  border-spacing: 0;
}

th,
td {
  border-bottom: 1px solid #ccc;
  border-right: 1px solid #ccc;
}
```

## Dummy top left header cell

The last trick is a kind of shame. It's the top left header cell that should be fixed horizontally and vertically. We can achieve it by the `transform` property but the other top header cells hides it. I tried to make it rise with `z-index` but didn't work. So I created a dummy element that had the same size with the cell.

```js
var topLeft = document.createElement('div');
var computed = window.getComputedStyle(columnHeaders[0]);
container.appendChild(topLeft);
topLeft.classList.add('top-left');
topLeft.style.width = computed.width;
topLeft.style.height = computed.height;
```

```css
.top-left {
  background: #eee;
  border-right: 1px solid #ccc;
  border-bottom: 1px solid #ccc;
  box-sizing: border-box;
  position: absolute;
  top: 0;
  left: 0;
}
```

## Compatibility and performance

As far as I've tested with the latest Chrome, Firefox and Safari on Mac, it worked well without any performance issue. I'll test it with more large table on other browsers including IE and add the result later.
