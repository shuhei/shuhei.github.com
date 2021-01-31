---
layout: post
title: "HTTP request timeouts in JavaScript"
date: 2017-05-14
tags: [JavaScript, Node.js]
---

These days I have been working on a Node.js front-end server that calls back-end APIs and renders HTML with React components. In this microservices setup, I am making sure that the server doesn't become too slow even when its dependencies have problems. So I need to set timeouts to the API calls so that the server can give up non-essential dependencies quickly and fail fast when essential dependencies are out of order.

As I started looking at timeout options carefully, I quickly found that there were many different kinds of timeouts even in the very limited field, HTTP request with JavaScript.

## Node.js `http` and `https`

Let's start with the standard library of Node.js. `http` and `https` packages provide `request()` function, which makes a HTTP(S) request.

### Timeouts on `http.request()`

[`http.request()`](http://nodejs.org/api/http.html#http_http_request_options_callback) takes a `timeout` option. Its documentation says:

> `timeout` `<number>`: A number specifying the socket timeout in milliseconds. This will set the timeout before the socket is connected.

So what does it actually do? It internally calls `net.createConnection()` with its `timeout` option, which eventually calls `socket.setTimeout()` before the socket starts connecting.

There is also [`http.ClientRequest.setTimeout()`](http://nodejs.org/api/http.html#http_request_settimeout_timeout_callback). Its documentation says:

> Once a socket is assigned to this request and is connected `socket.setTimeout()` will be called.

So this also calls [`socket.setTimeout()`](http://nodejs.org/api/net.html#net_socket_settimeout_timeout_callback).

Either of them doesn't close the connection when the socket timeouts but only emits a `timeout` event.

So, what does `socket.setTimeout()` do? Let's check.

### net.Socket.setTimeout()

[The documentation](http://nodejs.org/api/net.html#net_socket_settimeout_timeout_callback) says:

> Sets the socket to timeout after timeout milliseconds of inactivity on the socket. By default `net.Socket` does not have a timeout.

OK, but what does "inactivity on the socket" exactly mean? In a happy path, a TCP socket follows the following steps:

1. Start connecting
2. DNS lookup is done: `lookup` event (Doesn't happen in HTTP Keep-Alive)
3. Connection is made: `connect` event (Doesn't happen in HTTP Keep-Alive)
4. Read data or write data

When you call `socket.setTimeout()`, a timeout timer is created and restarted before connecting, after `lookup`, after `connect` and each data read & write. So the `timeout` event is emitted on one of the following cases:

- DNS lookup doesn't finish in the given timeout
- TCP connection is not made in the given timeout after DNS lookup
- No data read or write in the given timeout after connection, previous data read or write

This might be a bit counter-intuitive. Let's say you called `socket.setTimeout(300)` to set the timeout as 300 ms, and it took 100 ms for DNS lookup, 100 ms for making a connection with a remote server, 200 ms for the remote server to send response headers, 50 ms for transferring the first half of the response body and another 50 ms for the rest. While the entire request & response took more than 500 ms, `timeout` event is not emitted at all.

Because the timeout timer is restarted in each step, timeout happens only when a step is not completed in the given time.

Then what happens if timeouts happen in all of the steps? As far as I tried, `timeout` event is triggered only once.

Another concern is HTTP Keep-Alive, which reuses a socket for multiple HTTP requests. What happens if you set a timeout for a socket and the socket is reused for another HTTP request? Never mind. `timeout` set in an HTTP request does not affect subsequent HTTP requests because [the timeout is cleaned up when it's kept alive](https://github.com/nodejs/node/blob/v7.10.0/lib/_http_client.js#L546).

### HTTP Keep-Alive & TCP Keep-Alive

This is not directly related to timeout, but I found Keep-Alive options in `http`/`https` are a bit confusing. They mix HTTP Keep-Alive and TCP Keep-Alive, which are completely different things but coincidentally have the same name. For example, the options of [`http.Agent` constructor](http://nodejs.org/api/http.html#http_new_agent_options) has `keepAlive` for HTTP Keep-Alive and `keepAliveMsecs` for TCP Keep-Alive.

So, how are they different?

- HTTP Keep-Alive reuses a TCP connection for multiple HTTP requests. It saves the TCP connection overhead such as DNS lookup and TCP slow start.
- TCP Keep-Alive closes invalid connections, and it is normally handled by OS.

### So?

`http`/`https` use `socket.setTimeout()` whose timer is restarted in stages of socket lifecycle. It doesn't ensure a timeout for the overall request & response. If you want to make sure that a request completes in a specific time or fails, you need to prepare your own timeout solution.

## Third-party modules

### `request` module

[request](https://github.com/request/request) is a very popular HTTP request library that supports many convenient features on top of `http`/`https` module. Its README says:

> `timeout` - Integer containing the number of milliseconds to wait for a server to send response headers (and start the response body) before aborting the request.

However, as far as I checked the implementation, `timeout` is not applied to the timing of response headers as of v2.81.1.

Currently this module emits the two types of timeout errors:

- `ESOCKETTIMEDOUT`: Emitted from `http.ClientRequest.setTimeout()` described above, which uses `socket.setTimeout()`.
- `ETIMEDOUT`: Emitted when a connection is not established in the given timeout. It was applied to the timing of response headers before v2.76.0.

There is [a GitHub issue](https://github.com/request/request/issues/2535) for it, but I'm not sure if it's intended and the README is outdated, or it's a bug.

By the way, `request` provides a useful timing measurement feature that you can enable with `time` option. It will help you to define a proper timeout value.

### `axios` module

[`axios`](https://github.com/mzabriskie/axios) is another popular library that uses `Promise`. Like `request` module's README, its `timeout` option timeouts if the response status code and headers don't arrive in the given timeout.

## Browser APIs

While my initial interest was server-side HTTP requests, I become curious about browser APIs as I was investigating Node.js options.

### XMLHttpRequest

[`XMLHttpRequest.timeout`](http://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/timeout) aborts a request after the given timeout and calls `ontimeout` event listeners. The documentation does not explain the exact timing, but I guess that it is until `readyState === 4`, which means that the entire response body has arrived.

### fetch()

As far as I read [`fetch()`'s documentation on MDN](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch), it does not have any way to specify a timeout. So we need to handle by ourselves. We can do that easily using [`Promise.race()`](http://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/race).

```js
function withTimeout(msecs, promise) {
  const timeout = new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(new Error("timeout"));
    }, msecs);
  });
  return Promise.race([timeout, promise]);
}

withTimeout(1000, fetch("https://foo.com/bar/"))
  .then(doSomething)
  .catch(handleError);
```

This kind of external approach works with any HTTP client and timeouts for the overall request and response. However, it does not abort the underlying HTTP request while preceding timeouts actually abort HTTP requests and save some resources.

## Conclusion

Most of the HTTP request APIs in JavaScript doesn't offer timeout mechanism for the overall request and response. If you want to limit the maximum processing time for your piece of code, you have to prepare your own timeout solution. However, if your solution relies on a high-level abstraction like `Promise` and cannot abort underlying TCP socket and HTTP request when timeout, it is nice to use an existing low-level timeout mechanisms like `socket.setTimeout()` together to save some resources.
