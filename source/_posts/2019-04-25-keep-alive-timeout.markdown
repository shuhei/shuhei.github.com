---
layout: post
title: "Check Your server.keepAliveTimeout"
date: 2019-04-25 23:29
comments: true
categories: [Node.js]
---

One of my Node.js server applications at work had constant 502 errors at AWS ELB (Application Load Balancer) in front of it (`HTTPCode_ELB_502_Count`). The number was very small. It was around 0.001% of the entire requests. It was not happening on other applications with the same configuration but with shorter response times and more throughputs. Because of the low frequency, I hadn't bothered investigating it for a while.

```
clients -> AWS ELB -> Node.js server
```

I recently came across a post, [A tale of unexpected ELB behavior.](https://medium.com/@liquidgecka/a-tale-of-unexpected-elb-behavior-5281db9e5cb4). It says ELB pre-connects to backend servers and it can cause a race condition where ELB thinks a connection is open but the backend closes it. It clicked my memory about the ELB 502 issue. After some googling, I found [Tuning NGINX behind Google Cloud Platform HTTP(S) Load Balancer](https://blog.percy.io/tuning-nginx-behind-google-cloud-platform-http-s-load-balancer-305982ddb340). It describes an issue on GCP Load Balancer and NGINX, but its takeaway was to have the server's keep alive idle timeout longer than the load balancer's timeout. This seemed applicable even to AWS ELB and Node.js server.

According to [AWS documentation](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/application-load-balancers.html#connection-idle-timeout), Application Load Balancer has 60 seconds of connection idle timeout by default. It also suggests:

>We also recommend that you configure the idle timeout of your application to be larger than the idle timeout configured for the load balancer.

[Node.js `http`/`https` server has 5 seconds keep alive timeout by default](https://nodejs.org/api/http.html#http_server_keepalivetimeout). I wanted to make it longer. With [Express](https://expressjs.com/), we can do it like the following:

```js
const express = require("express");

const app = express();
// Set up the app...
const server = app.listen(8080);

server.keepAliveTimeout = 61 * 1000;
```

And the ELB 502 errors disappeared!

As a hindsight, there was already [Dealing with Intermittent 502's between an AWS ALB and Express Web Server](https://adamcrowder.net/posts/node-express-api-and-aws-alb-502/) in the internet, which exactly describes the same issue with more details. (I found it while writing this post...) Also, the same issue seems to be happening with different load balancers/proxies and different servers. Especially the 5 second timeout of Node.js is quite short and prone to this issue. I found that it had happened with a reverse proxy ([Skipper as k8s ingress](https://github.com/zalando-incubator/kube-ingress-aws-controller)) and another Node.js server at work. I hope this issue becomes more widely known.
