---
layout: post
title: "How to export CommonJS and ES Module"
date: 2017-01-05 22:11
comments: true
categories: [JavaScript]
---

After [my previous post about jsnext:main and module](/blog/2017/01/05/main-jsnext-main-and-module/), there came another issue.

- [colors.es2015.js and colors.js have different APIs · Issue #16 · shuhei/material-colors](https://github.com/shuhei/material-colors/issues/16).

Here is the twists and turns that I wandered to solve the problem.

## Exports

The code of `material-colors` looked like the following.

`colors.js` specified in `main` (CommonJS version)

```js
module.exports = {
  red: { /* ... */ },
  blue: { /* ... */ }
};
```

`colors.es2015.js` specified in `jsnext:main/module` (ES Module version)

```js
export var red = { /* ... */ };
export var blue = { /* ... */ };
```

Then the ES Module file can get benefit of tree shaking if it's imported by named imports.

## Problem of having only named exports

The `colors.es2015.js` broke `react-color` when built with Webpack 2 because it was doing default import but `colors.es2015.js` didn't have default export.

```js
import material from 'material-colors';
console.log(material.red);
```

So [@echenley](https://github.com/echenley) suggested to change it to a wildcard import.

```js
import * as material from 'material-colors';
console.log(material.red);
```

It worked well, but I removed `jsnext:main` and `module` because other libraries with default import may break on Webpack 2 and `material-colors` is already tiny without tree shaking anyway.

## Have a default export

After a while, I came up with a better solution to have a default export in addition to named exports. Then it will work well with tree shaking and won't break default import. Pretty obvious after coming up.

```js
export var red = { /* ... */ };
export var blue = { /* ... */ };

export default {
  red: red,
  blue: blue
};
```

## So?

To keep maximum compatibility for CommonJS and ES Module:

- If your CommonJS module exports only one thing, like encouraged in the npm world, export it as a default export.
- If your CommonJS module exports multiple things, which essentially exports an object with them as properties, export named exports. In addition to it, it's safer to have a default export just in case for the problem described above.
