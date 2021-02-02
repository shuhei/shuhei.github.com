---
title: "DNS polling for reliability"
tags: [Node.js]
---

In December 2018, I wrote a package to poll and cache DNS records, [pollen](https://github.com/shuhei/pollen), as a mitigation for incidents at work.

My team at work migrated our Node.js servers from AWS EC2 C4 instances to C5 instances. Then mysterious timeout errors on outbound HTTP(S) calls started happening. They happened only in an availability zone at a time. We tried different things to investigate the issue, like profiling and `tcpdump`, but couldn't find the cause. Eventually, AWS Support suggested that the incidents were correlated to DNS timeouts in their metrics. According to them, C5 instances don't retry DNS lookups while C4 instances do.

## Node.js is vulnerable to DNS failures

In the microservice world, we work hard to make remote procedure calls (with HTTPS) reliable. We use timeout, retry, fallback, etc. to make it as reliable as possible. However, we hadn't paid enough attention to DNS lookup, which we use for service discovery. It can easily be a single point of failure because we can't call servers without knowing their IP addresses.

Node.js is especially vulnerable to DNS lookup failures because:

- Node.js standard library doesn't have DNS cache by default while other languages/runtimes like Java and Go have it by default.
- Node.js uses a small thread pool to make DNS lookups. When there are slow DNS queries or packet loss, subsequent DNS lookups need to wait for them to finish or timeout.
  - Before [Node 10.12.0](https://github.com/nodejs/node/pull/22997), it was even worse because slow DNS queries affected other tasks in the thread pool like file IO and gzip encoding/decoding.

## Caching at OS-level

We can make DNS lookups fast and reliable by caching it. [An issue on the nodejs/node repo](https://github.com/nodejs/node/issues/5893) recommends to have caching at OS-level. We can run a daemon like dnsmasq, unbound, CoreDNS, etc.

However, it's not always easy depending on the platform that you are using. My team was using [a platform where we just deploy your application Docker container](https://stups.io/), and it was hard to set up another daemon on the OS. The majority of the users of the platform were application runtimes such as Java and Go, which have basic DNS caching by default and rarely have the same issues with Node.js applications. It was hard to convince the platform team to introduce per-node DNS caching to the platform only for Node.js applications without a concrete evidence while they were focusing on a new Kubernetes-based platform. (They eventually added per-node DNS caching to the new platform later, but the application in question won't move to it because of reasons...)

Because the incidents didn't happen on C4 instances and we had other priorities to work on, we just rolled back and kept using C4 instances for a while. However, I wanted to finish the issue before celebrating 2019. So, I decided to implement DNS caching on the application layer with Node.js.

## DNS caching and prefetching with Node.js

There were already some DNS caching packages:

- [yahoo/dnscache](https://github.com/yahoo/dnscache)
- [eduardbcom/lookup-dns-cache](https://github.com/eduardbcom/lookup-dns-cache)

The packages looked great, but there was an edge case that they didn't cover. Both of the packages throw away caches after some time (`dnscache` uses `ttl` option and `lookup-dns-cache` uses the TTL that DNS servers return) and make DNS lookups again. This poses a risk where HTTP requests fail if DNS servers are down at the time.

To avoid making DNS lookups on demand, we can prefetch DNS records and always provide cached DNS records. This means that we may get outdated IP addresses. However, DNS records didn't change often for my case. I thought it would be better to use expired DNS records than just giving up. In the worst case, we would get an SSL certificate error if the expired IP addresses point to wrong servers as long as we use HTTPS.

## HTTP Keep-Alive (persistent connection)

There was another issue that I wanted to solve with this package: keeping HTTP Keep-Alive connections as long as possible.

We have been using HTTP Keep-Alive for good performance. However, we couldn't keep the Keep-Alive connections forever because our backend servers may change their IP addresses (DNS-based traffic switch in our case). To avoid keeping stale connections, we were re-creating TCP/TLS connections for each minute, by rotating HTTP agents and later using the `activeSocketTTL` option of `keepaliveagent`. However, this is not optimal because IP addresses don't change most of the time.

The DNS caching and prefetching tell us when IP addresses change. So we can keep using existing connections as long as IP addresses stay same and re-connect only when IP addresses change. In this way, we can avoid unnecessary TCP/TLS handshakes.

## Result

I wrote [pollen](https://github.com/shuhei/pollen), tested it with C4 instances and migrated our servers to C5 again. No issues happened after five months. So, it seems that DNS failure was the cause and the package can mitigate it.

I had expected performance improvement because of fewer TCP/TLS handshakes, but I didn't find much difference in latency.

## How to use it

```sh
npm i -S @shuhei/pollen
# or
yarn add @shuhei/pollen
```

```js
const https = require("https");
const { DnsPolling, HttpsAgent } = require("@shuhei/pollen");

const dnsPolling = new DnsPolling({
  interval: 30 * 1000 // 30 seconds by default
});
// Just a thin wrapper of https://github.com/node-modules/agentkeepalive
// It accepts all the options of `agentkeepalive`.
const agent = new HttpsAgent();

const hostname = "shuheikagawa.com";
const req = https.request({
  hostname,
  path: "/",
  // Make sure to call `getLookup()` for each request!
  lookup: dnsPolling.getLookup(hostname),
  agent
});
```

## Bonus: DNS lookup metrics

Because DNS lookup is a critical operation, it is a good idea to monitor its rate, errors and latency. `pollen` emits events for this purpose.

```js
dnsPolling.on("resolve:success", ({ hostname, duration, update }) => {
  // Hypothetical functions to update metrics...
  recordDnsLookup();
  recordDnsLatency(duration);

  if (update) {
    logger.info({ hostname, duration }, "IP addresses updated");
  }
});
dnsPolling.on("resolve:error", ({ hostname, duration, error }) => {
  // Hypothetical functions to update metrics...
  recordDnsLookup();
  recordDnsLatency(duration);
  recordDnsError();

  logger.warn({ hostname, err: error, duration }, "DNS lookup error");
});
```

I was surprised by DNS lookups occasionally taking 1.5 seconds. It might be because of retries of [c-ares](https://c-ares.haxx.se/), but I'm not sure yet ([its default timeout seems to be 5 seconds...](https://c-ares.haxx.se/ares_init_options.html)).

Because `pollen` makes fewer DNS lookups, the events don't happen frequently. I came across an issue of histogram implementation that greatly skewed percentiles of infrequent events, and started using HDR histograms. Check out [Histogram for Time-Series Metrics on Node.js](/blog/2018/12/29/histogram-for-time-series-metrics-on-node-js/) for more details.

Even if you don't use `pollen`, it is a good idea to monitor DNS lookups.

```js
const dns = require("dns");

const lookupWithMetrics = (hostname, options, callback) => {
  const cb = callback || options;
  const startTime = Date.now();

  function onLookup(err, address, family) {
    const duration = Date.now() - startTime;
    cb(err, address, family);

    // Hypothetical functions to update metrics...
    recordDnsLookup();
    recordDnsLatency(duration);
    if (err) {
      recordDnsError();
      logger.warn({ hostname, err, duration }, "DNS lookup error");
    }
  }

  return dns.lookup(hostname, options, onLookup);
};

const req = https.request({
  // ...
  lookup: lookupWithMetrics
});
```

## Conclusion

Give [pollen](https://github.com/shuhei/pollen) a try if you are:

- seeing DNS timeouts on outbound API calls
- using DNS for service discovery
- running your Node.js servers without DNS caching

Also, don't forget to monitor DNS lookups!
