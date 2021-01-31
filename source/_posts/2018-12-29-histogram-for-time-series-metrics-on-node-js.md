---
layout: post
title: "Histogram for time-series metrics on Node.js"
date: 2018-12-29
categories: [Node.js]
---

## The "metrics" library

I have been using [metrics](https://github.com/mikejihbe/metrics) library for application metrics of Node.js applications at work. It was already widely used in the company when I joined, and I kept using it without questioning much.

The [metrics](https://github.com/mikejihbe/metrics) library was ported from [Dropwizard metrics](https://github.com/dropwizard/metrics), which is a widely-used metrics library for Java and also called as Coda Hale metrics, Yammer metrics, or Metrics Core. It supports various metrics types like Counter, Gauge, Histogram, Meter (a combination of Counter and Histogram), etc., and nice reporting abstraction.

Just before my last working day of 2018, I saw a weird chart with a p99.9 response time metric with only around 50 data points per minute. Outliers were staying for ~15 minutes (much longer than expected) and suddenly disappearing. I thought I was misusing the library. That's why I started reading the source code of [metrics](https://github.com/mikejihbe/metrics) library, especially `Histogram`.

## EDS-based histogram

The `metrics` library uses [Exponentially Decaying Sample (EDS)](https://github.com/mikejihbe/metrics/blob/v0.1.20/stats/exponentially_decaying_sample.js) for `Histogram`. The name is intimidating, but the implementation is not so complicated.

It sets a priority to each value based on its timing and **some randomness**, and values of top-1028 priorities survive (by default). As a result, the chance of a value's survival decays as time goes by.

It seems to have a problem that the influence of an old value stays longer than expected, which was fixed in the Java implementation after the `metrics` library was ported to JavaScript. Maybe I can port the fix to the JavaScript implementation?

But, wait. Why do I need the decay at all? Most of my use cases of the histogram are to plot percentiles of response times. The data points are per minute. All I want for each data point is percentiles of all the response times **measured in the last minute**. I don't need response times from previous minutes because they are already plotted on the chart. Also, I don't want values in the last half of the minute to have more influence than values in the first half.
So, **I don't need the decay effect at all**.

In addition to that, EDS randomly ignores values. Yes, it **samples**. Random sampling is a problem because I'm interested in a small number of outliers.

## HDR histogram

I tweeted about these issues, and [my former colleague @cbirchall (Thanks!) suggested](https://twitter.com/cbirchall/status/1077526632951414784) to take a look at [HdrHistogram](https://github.com/HdrHistogram/HdrHistogram). I don't understand how it works (yet), but it claims to keep accuracy without sacrificing memory footprint and performance.

[Your Latency Metrics Could Be Misleading You — How HdrHistogram Can Help](https://medium.com/hotels-com-technology/your-latency-metrics-could-be-misleading-you-how-hdrhistogram-can-help-9d545b598374) by Will Tomlin on the Hotels.com Technology Blog illustrates shortcomings of the EDS-based histogram and advantages of the HDR histogram pretty well.

OK, I'm sold.

## Benchmark on Node.js

Then, how can I use HDR Histogram on Node.js? I found three implementations:

- [hdr-histogram-js](https://github.com/HdrHistogram/HdrHistogramJS): JS implementation in the same GitHub org as the Java implementation
- [native-hdr-histogram](https://github.com/mcollina/native-hdr-histogram): A binding to a C implementation
- [node-hdr-histogram](https://github.com/kiggundu/node-hdr-histogram): A binding to the Java implementation

Also EDS-based histogram implementations:

- [metrics](https://github.com/mikejihbe/metrics): The library I'm using at work
- [measured-core](https://github.com/yaorg/node-measured/tree/master/packages/measured-core): Actively maintained and widely used by Node.js developers ([Thanks @\_vigneshh for letting me know!](https://twitter.com/_vigneshh/status/1078287577394880512))

I compared them, excluding `node-hdr-histogram` because I think it's an overkill to run JVM only for metrics (and won't perform well anyway). The benchmark code is on [a gist](https://gist.github.com/shuhei/3a747b26b62242ae795616b04c24024f), and here is the result on Node.js 10.14.2.

Adding 10K values to a histogram:

- metrics: 173 ops/sec ±2.00% (80 runs sampled)
- measured: 421 ops/sec ±1.19% (90 runs sampled)
- hdr-histogram-js: 1,769 ops/sec ±1.84% (92 runs sampled)
- native-hdr-histogram: 1,516 ops/sec ±0.82% (92 runs sampled)

Extracting 12 different percentiles from a histogram:

- metrics: 1,721 ops/sec ±1.93% (92 runs sampled)
- measured: 3,709 ops/sec ±0.78% (93 runs sampled)
- measured (weighted percentiles): 2,383 ops/sec ±1.30% (90 runs sampled)
- hdr-histogram-js: 3,509 ops/sec ±0.61% (93 runs sampled)
- native-hdr-histogram: 2,760 ops/sec ±0.76% (93 runs sampled)

According to the result, `hdr-histogram-js` is accurate and fast enough. Check out [the gist](https://gist.github.com/shuhei/3a747b26b62242ae795616b04c24024f) for more details!

## Reset strategy

While HDR Histogram can keep numbers more accurately than Exponentially Decaying Sample, it doesn't throw away old values by itself. We need a strategy to remove old values out of it. In a sense, EDS is a reset strategy. If we don't use it, we need another one.

[Documentation of rolling-metrics library](https://github.com/vladimir-bukhtoyarov/rolling-metrics/blob/e1bff04f05743b642585897182bb6807b1bdfce2/histograms.md#configuration-options-for-evicting-the-old-values-of-from-reservoir) lists up strategies and their trade-offs.

- Reset on snapshot
- Reset periodically
- Reset periodically by chunks (rolling time window)
- Never reset

_Reset on snapshot_ looks a bit hacky (we need to keep metrics collection only once in an interval) but should be easy to implement and practical. _Rolling time window_ looks more rigorous, but a bit tedious to implement, especially about choosing the right parameters.

I made a quick survey of popular libraries and frameworks.

- Hysterix: [HdrHistogram + rolling time window](https://github.com/Netflix/Hystrix/blob/v1.5.18/hystrix-core/src/main/java/com/netflix/hystrix/metric/consumer/RollingCommandLatencyDistributionStream.java)
- Finagle: [HdrHistogram + rolling time window](https://github.com/twitter/finagle/blob/finagle-18.12.0/finagle-core/src/main/scala/com/twitter/finagle/util/WindowedPercentileHistogram.scala)
- Resilience4j: Uses Prometheus?
- Prometheus: Supports [Histogram and Summary](https://prometheus.io/docs/practices/histograms/) by its own implementation
- [rolling-metrics](https://github.com/vladimir-bukhtoyarov/rolling-metrics): Supports HdrHistogram and multiple strategies including rolling time window.
- [metrics-scala](https://github.com/erikvanoosten/metrics-scala): Supports HdrHistogram + only reset on snapshot strategy. Depends on [hdrhistogram-metrics-reservoir](https://bitbucket.org/marshallpierce/hdrhistogram-metrics-reservoir).

_Rolling time window_ strategy seems to be most popular, but I couldn't find a consensus on default parameters (length of the time window, bucket size, etc.). For the next step, I'll probably start with _reset on snapshot_ strategy and see if it works well.

**Update on Jan 11, 2019:** I wrote [a package to use HDR histogram with rolling time window](https://github.com/shuhei/rolling-window).

## Conclusion

HDR Histogram is more accurate than EDS-based Histogram for tracking response times in a time series. [hdr-histogram-js](https://github.com/HdrHistogram/HdrHistogramJS) is accurate and performant. It seems to be the best option on Node.js. We need a way to remove old values from a histogram. _Reset on snapshot_ is easy and practical, but _rolling time window_ is more rigorous.

After the research on this topic, I got an impression that HDR Histogram is well-known in the Java/JVM community, but probably not so much in other communities. I made a benchmark on Node.js in this post, but it might be useful to review your metrics implementation on other programming languages or platforms as well.
