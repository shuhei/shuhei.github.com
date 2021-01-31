---
layout: post
title: "Node.js executable module"
date: 2015-10-25
tags: [JavaScript]
---

You may want to create a Node module that is also an executable. The convention is to create two files, one for lib and the other for bin, but I think it's OK for simple modules.

To achieve it, you need to detect whether it's executed as an entry point. According to [the official documentation of Node](https://nodejs.org/api/modules.html#modules_accessing_the_main_module):

>When a file is run directly from Node.js, `require.main` is set to its module. That means that you can determine whether a file has been run directly by testing
>```
>require.main === module
>```

For example:

```js
#!/usr/bin/env node

function sum(a, b) {
  return a + b;
}

module.exports = sum;

if (require.main === module) {
  var a = parseInt(process.argv[2], 10);
  var b = parseInt(process.argv[3], 10);
  console.log(sum(a, b));
}
```

Then you can use it as an executable and a module.

```sh
$ node sum.js 3 4
7
$ node
> require('./sum')(3, 4)
7
```
