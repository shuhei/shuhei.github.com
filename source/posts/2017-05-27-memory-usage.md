---
title: "Getting memory usage in Linux and Docker"
tags: [Linux, Docker]
---

Recently I started monitoring a Node.js app that we have been developing at work. After a while, I found that its memory usage % was growing slowly, like 20% in 3 days. The memory usage was measured in the following Node.js code.

```js
const os = require("os");

const total = os.totalmem();
const free = os.freemem();
const usage = ((free - total) / total) * 100;
```

So, they are basically from OS, which was [Alpine Linux](https://alpinelinux.org/) on Docker in this case. Luckily I also had memory usages of application processes recorded, but they were not increasing. Then why is the OS memory usage increasing?

## Buffers and cached memory

I used `top` command with `Shift+m` (sort by memory usage) and compared processes on a long-running server and ones on a newly deployed server. Processes on each side were almost same. The only difference was that `buffers` and `cached Mem` were high on the long-running one.

After some research, or googling, I concluded that it was not a problem. Most of `buffers` and `cached Mem` are given up when application processes claim more memory.

Actually `free -m` command provides a row for `used` and `free` taking buffers and cached into consideration.

```console
$ free -m
             total  used  free  shared  buffers cached
Mem:          3950   285  3665     183       12    188
-/+ buffers/cache:    84  3866
Swap:         1896     0  1896
```

So, what are they actually? According to [the manual of `/proc/meminfo`](http://man7.org/linux/man-pages/man5/proc.5.html), which is a pseudo file and the data source of `free`, `top` and friends:

```
Buffers %lu
       Relatively temporary storage for raw disk blocks that
       shouldn't get tremendously large (20MB or so).

Cached %lu
       In-memory cache for files read from the disk (the page
       cache).  Doesn't include SwapCached.
```

I am still not sure what exactly `Buffers` contains, but it contains metadata of files, etc. and it’s relatively trivial in size. `Cached` contains cached file contents, which are called page cache. OS keeps page cache while RAM has enough free space. That was why the memory usage was increasing even when processes were not leaking memory.

If you are interested, [What is the difference between Buffers and Cached columns in /proc/meminfo output?](https://www.quora.com/What-is-the-difference-between-Buffers-and-Cached-columns-in-proc-meminfo-output) on Quora has more details about `Buffers` and `Cached`.

## MemAvailable

So, should we use `free + buffers + cached`? `/proc/meminfo` has an even better metric called `MemAvailable`.

```console
MemAvailable %lu (since Linux 3.14)
       An estimate of how much memory is available for
       starting new applications, without swapping.
```

```console
$ cat /proc/meminfo
MemTotal:        4045572 kB
MemFree:         3753648 kB
MemAvailable:    3684028 kB
Buffers:           13048 kB
Cached:           193336 kB
...
```

Its background is explained well in [the commit in Linux Kernel](https://github.com/torvalds/linux/commit/34e431b0ae398fc54ea69ff85ec700722c9da773), but essentially it excludes non-freeable page cache and includes reclaimable slab memory. [The current implementation in Linux v4.12-rc2](https://github.com/torvalds/linux/blob/v4.12-rc2/mm/page_alloc.c#L4341-L4382) still looks almost same.

Some implementation of `free -m` have `available` column. For example, on Boot2Docker:

```console
$ free -m
       total  used  free  shared  buff/cache  available
Mem:    3950    59  3665     183         226       3597
Swap:   1896     0  1896
```

It is also [available on AWS CloudWatch metrics](http://docs.aws.amazon.com/AWSEC2/latest/UserGuide/mon-scripts.html) via `--mem-avail` flag.

## Some background about Docker

My another question was “Are those metrics same in Docker?”. Before diving into this question, let’s check how docker works.

According to [Docker Overview: The Underlying Technology](https://docs.docker.com/engine/docker-overview/#the-underlying-technology), processes in a Docker container directly run in their host OS without any virtualization, but they are isolated from the host OS and other containers in effect thanks to these Linux kernel features:

- [namespaces](https://en.wikipedia.org/wiki/Linux_namespaces): Isolate PIDs, hostnames, user IDs, network accesses, IPC, etc.
- [cgroups](https://en.wikipedia.org/wiki/Cgroups): Limit resource usage
- [UnionFS](https://en.wikipedia.org/wiki/UnionFS): Isolate file system

Because of the namespaces, `ps` command lists processes of Docker containers in addition to other processes in the host OS, while it cannot list processes of host OS or other containers in a docker container.

[By default, Docker containers have no resource constraints](https://docs.docker.com/engine/admin/resource_constraints/#memory). So, if you run one container in a host and don’t limit resource usage of the container, and this is my case, the container’s “free memory” is same as the host OS’s “free memory”.

## Memory metrics on Docker container

If you want to monitor a Docker container's memory usage from outside of the container, it's easy. You can use `docker stats`.

```console
$ docker stats
CONTAINER     CPU %  MEM USAGE / LIMIT  MEM %  NET I/O     BLOCK I/O  PIDS
fc015f31d9d1  0.00%  220KiB / 3.858GiB  0.01%  1.3kB / 0B  0B / 0B    2
```

But if you want to get the memory usage in the container or get more detailed metrics, it gets complicated. [Memory inside Linux containers](https://fabiokung.com/2014/03/13/memory-inside-linux-containers/) describes the difficulties in details.

`/proc/meminfo` and `sysinfo`, which is used by `os.totalmem()` and `os.freemem()` of Node.js, are not isolated, you get metrics of host OS if you use normal utilities like `top` and `free` in a Docker container.

To get metrics specific to your Docker container, [you can check pseudo files in `/sys/fs/cgroup/memory/`](https://docs.docker.com/engine/admin/runmetrics/). They are not standardized according to [Memory inside Linux containers](https://fabiokung.com/2014/03/13/memory-inside-linux-containers/) though.

```console
$ cat /sys/fs/cgroup/memory/memory.usage_in_bytes
303104
$ cat /sys/fs/cgroup/memory/memory.limit_in_bytes
9223372036854771712
```

`memory.limit_in_bytes` returns a very big number if there is no limit. In that case, you can find the host OS’s total memory with `/proc/meminfo` or commands that use it.

## Conclusion

It was a longer journey than I initially thought. My takeaways are:

- Available Memory > Free Memory
- Use `MemAvailable` if available (pun intended)
- Processes in a Docker container run directly in host OS
- Understand what you are measuring exactly, especially in a Docker container
