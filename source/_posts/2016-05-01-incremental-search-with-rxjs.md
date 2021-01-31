---
layout: post
title: "Incremental search with RxJS switchMap"
tags: [JavaScript, RxJS]
---

RxJS leads us to better design separating data flow and side-effects. In addition, it provides powerful functionalities that sophisticate the outcome application. My favorite is [`switchMap`](http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-switchMap) of RxJS 5, which is equivalent to [`flatMapLatest`](https://github.com/Reactive-Extensions/RxJS/blob/master/doc/api/core/operators/flatmaplatest.md) in RxJS 4.

## switchMap

`switchMap(func)` is equivalent to `map(func).switch()`. It keeps subscribing latest observable at the moment and unsubscribing outdated ones so that it only streams events from latest observable at the moment. [Take a look at the marble chart for `switch`](http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-switch). It illustrates the behavior well.

## Incremental search

`switchMap` is convenient for properly implementing incremental search. Incremental search makes multiple requests to a server. The server can respond in a different order from requests'. Because of the order, a naive implementation may show a wrong result. However, you can effortlessly avoid the caveat if you use `switchMap`.

Here is an example. Type fast in the text fields. **Without switchMap** sometimes shows a wrong result while **With switchMap** always works fine.

<a href="http://jsbin.com/megiqo/edit" target="_blank">JS Bin on jsbin.com</a>

`search` function mocks an AJAX request. It returns a `Promise` that resolves after a random delay.

```js
function search(keyword) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve('Result of ' + keyword);
    }, Math.random() * 1000);
  });
}
```

A naive implementation always shows the last response at the time. A wrong result is shown if responses come in a different order from requests'. We could add some debouncing to decrease the chance of the wrong order but it still may happen when response time is longer than the debounce time.

```js
const keyword = document.getElementById('keyword-without');
const result = document.getElementById('result-without');

keyword.addEventListener('keyup', e => {
  const value = e.target.value;
  search(value)
    .then(data => result.textContent = data);
});
```

`switchMap` guarantees that the last keyword's result is finally shown.

```js
const keyword = document.getElementById('keyword-with');
const result = document.getElementById('result-with');

const keyword$ = Rx.Observable.fromEvent(keyword, 'keyup')
  .map(e => e.target.value);
keyword$
  .switchMap(search)
  .subscribe(data => result.textContent = data);
```
