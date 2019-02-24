---
layout: post
title: "DNS Polling for Reliability"
date: 2019-02-24 18:01
comments: true
categories: [Node.js]
---

In December 2018, I wrote a package to poll and cache DNS records, [pollen](https://github.com/shuhei/pollen), as a mitigation for incidents at work.

We migrated our Node.js servers from AWS EC2 C4 instances to C5 instances. Then weird timeout errors on outbound HTTP(S) calls started happening. They happened only in an availability zone at a time. We had no clue and looked for the cause in different areas, but AWS Support suggested that the incidents were correlated to DNS timeouts in their metrics.

## Node.js is Vulnerable to DNS Failures

In the microservice world, we work hard to make remote procedure calls (with HTTPS) reliable. We use timeout, retry, fallback, etc. to make it as reliable as possible. However, we haven't cared much about DNS lookups. It can easily be a single point of failure because we can't call servers without knowing their IP addresses.

Node.js is especially vulnerable to DNS lookup failures because:

1. Node.js standard library doesn't have DNS cache by default while other languages/runtimes like Java and Go have it by default.
2. Node.js uses a small thread pool to make DNS lookups. When there are slow DNS queries or packet loss, subsequent DNS looks need to wait for them to finish or timeout.
  - Before [Node 10.12.0](https://github.com/nodejs/node/pull/22997), it was even worse because slow DNS queries affected other tasks in the threadpool like file IO and GZIP encoding/decoding.

## Caching at OS-level

We can make DNS lookups fast and reliable by caching it. [An issue on the nodejs/node repo](https://github.com/nodejs/node/issues/5893) recommends us to have caching at OS-level. We can run a daemon like dnsmasq, unbound, CoreDNS, etc.

However, it's not always easy depending on the platform that you are using. If you are using a platform where you just deploy your application container, it might be hard to set up another daemon on the OS. The platform might be supporting other application runtimes such as Java and Go, which have basic DNS caching by default and rarely have the same issues with Node.js applications. If that's the case, it's hard to convince the platform owner to introduce per-node DNS caching to the platform only for Node.js applications.

So, I decided to implement DNS caching on the application layer with Node.js.

## DNS Caching and Prefetching with Node.js

There were already some DNS caching packages:

- [yahoo/dnscache](https://github.com/yahoo/dnscache)
- [eduardbcom/lookup-dns-cache](https://github.com/eduardbcom/lookup-dns-cache)

The packages looked great, but there was an edge case that they didn't cover. Both of the packages throw away caches after some time (`dnscache` uses `ttl` option and `lookup-dns-cache` uses the TTL that DNS servers return) and make DNS lookups again. This poses a risk where HTTP requests fail if DNS servers are down at the time.

To avoid making DNS lookups on demand, we can prefetch DNS records and always provide cached DNS records. This means that we may provide outdated IP addresses. However, DNS records didn't change often for my case. I thought it would be better to use expired DNS records than just giving up. In the worst case, we would get an SSL certificate error if the expired IP addresses point to wrong servers as long as we use HTTPS.

## HTTP Keep-Alive (Persistent Connection)

There was another issue that I wanted to solve with this package: keeping HTTP Keep-Alive connections as long as possible.

We have been using HTTP Keep-Alive for good performance. However, we couldn't keep the Keep-Alive connections because our backend servers may change their IP addresses (DNS-based traffic switch in our case). To avoid keeping stale connections, it's common to re-create TCP/TLS connections after some time, for example one minute. We have been doing it by rotating HTTP agents and later using the `activeSocketTTL` option of `keepaliveagent`. However, this is a waste of resource because IP addresses don't change most of the time.

The DNS caching and prefetching tell us when IP addresses change. So we can keep using existing connections as long as IP addresses stay same and re-connect only when IP addresses change. In this way, we can avoid unnecessary TCP/TLS handshakes.

## How to Use

```sh
npm i -S @shuhei/pollen
# or
yarn add @shuhei/pollen
```

```js
const https = require('https');
const { DnsPolling, HttpsAgent } = require('@shuhei/pollen');

const dnsPolling = new DnsPolling({
  interval: 30 * 1000 // 30 seconds by default
});
// Just a thin wrapper of https://github.com/node-modules/agentkeepalive
// It accepts all the options of `agentkeepalive`.
const agent = new HttpsAgent();

const hostname = 'shuheikagawa.com';
const req = https.request({
  hostname,
  path: '/',
  // Make sure to call `getLookup()` for each request!
  lookup: dnsPolling.getLookup(hostname),
  agent,
});
```

## Conclusion

Give [pollen](https://github.com/shuhei/pollen) a try if you are:

- using DNS for service discovery
- seeing weird timeout errors on outbound API calls
- running your Node.js servers without DNS caching
