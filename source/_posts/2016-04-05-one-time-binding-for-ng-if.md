---
layout: post
title: "One-time binding for ng-if"
date: 2016-04-05
comments: true
tags: [JavaScript, AngularJS]
---

AngularJS's [one-time binding](https://docs.angularjs.org/guide/expression#one-time-binding) is useful to reduce the number of watches. It stops watching its expression once it becomes defined. It kindly keeps watching while the value is `undefined` for cases like asynchronous data fetching. But the kindness can be a pitfall especially for directives that take `boolean` expressions like `ng-if`.

Here's an ordinary piece of AngularJS template. It shows 'Something' when `obj.prop` exists.

```html
<div ng-if="::obj.prop">Something</div>
```

It works almost fine. But it keeps watching the expression when the message is hidden. Guess what?

Yes! It keeps watching while the expression is `undefined`. Let's make sure that it's always `boolean`.

```html
<div ng-if="::!!obj.prop">Something</div>
```

Here we see the birth of a new operator `::!!`!
