---
layout: post
title: "DNS Polling for Reliability"
date: 2019-01-11 01:27
comments: true
categories: [Node.js]
status: draft
---

I wrote [a package to poll and cache DNS records](https://github.com/shuhei/pollen) for reliability.

HTTP clients should be resilient to DNS failures.

## Node.js is Vulnerable to DNS Failures

In microservice world, we care a lot about making remote procedure calls reliably. We employ timeout, retry, fallback, etc. to achieve it. However, we don't care much about DNS lookup, which can easily be a single point of failure.

Node.js is especially vulnerable to DNS lookup failures.

1. Node.js doesn't have DNS cache by default.
2. Node.js uses a small thread pool to make DNS lookups, which is shared with other tasks such as file system operations and GZIP encoding/decoding.

## Caching and Prefetching

Caching is good.

- https://github.com/yahoo/dnscache
- https://github.com/eduardbcom/lookup-dns-cache

Both of the packages throw away caches after some time (`dnscache` uses `ttl` option and `lookup-dns-cache` uses the TTL that DNS servers return) and make DNS lookups again. This poses a risk where HTTP requests fail if DNS servers are down.

To avoid making DNS lookups on demand, we can prefetch DNS records and always provide cached DNS records. This means that we may provide outdated IP addresses. However, DNS records don't change often (It depends on your environment though). I think it's better to use expired DNS records than just giving up. In the worst case, we will get HTTPS certificate errors if the expired IP addresses point to wrong servers.

## OS or Application

It could be done at OS instead of the application layer. We could run a daemon like dnsmasq, unbound, CoreDNS, etc. It's the recommended way in [an issue on the nodejs/node repo](https://github.com/nodejs/node/issues/5893).

However, it's not always easy depending on the platform that you are using. If you are using a platform where you just deploy your application container, it might be hard to set up another daemon on the OS. The platform might be supporting other application runtimes such as Java and Go, which have basic DNS caching by default and rarely have the same issues with Node.js applications. If that's the case, it's hard to convince the platform owner to introduce per-node DNS caching to the platform only for Node.js applications.

## HTTP Keep-Alive (Persistent Connection)

It's nice to use HTTP Keep Alive for good performance. However, we cannot keep the Keep-Alive connections because backend servers may be updated (switch traffic to new server IP addresses). To avoid keeping stale connections, it's common to re-create TCP/TLS connections after some time. We have been doing it with HTTP agent pool or `activeSocketTTL` of `keepaliveagent`.

However, we already know when IP addresses change if we prefetch DNS records. So we can keep using existing connections as long as IP addresses stay same and re-connect only when IP addresses change. In this way, we can avoid unnecessary TCP/TLS handshakes.
