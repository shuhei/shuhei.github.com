---
title: "main, jsnext:main and module"
tags: [JavaScript]
---

Node module's `package.json` has `main` property. It's the entry point of a package, which is exported when a client `require`s the package.

Recently, I got [an issue](https://github.com/shuhei/material-colors/issues/13) on one of my popular GitHub repos, `material-colors`. It claimed that "colors.es2015.js const not supported in older browser (Safari 9)", which looked pretty obvious to me. ES2015 is a new spec. Why do older browsers support it?

I totally forgot about it at the time, but [the `colors.es2015.js` was exposed as the npm package's `jsnext:main`](https://github.com/shuhei/material-colors/pull/10). And to my surprise, it turned out that _`jsnext:main` shouldn't have *jsnext* or ES2015+ features_ like `const`, arrow function and `class`. What a contradiction!

## jsnext:main

Module bundlers that utilizes tree shaking to reduce bundle size, like Rollup and Webpack 2, require packages to expose ES Modules with `import` and `export`. So they invented a non-standard property called `jsnext:main`.

However, it had a problem. If the file specified `jsnext:main` contains ES2015+ features, it won't run without transpilation on browsers that don't support those features. But normally people don't transpile packages in `node_modules`, and many issues were created on GitHub. To solve the problem, people concluded that `jsnext:main` shouldn't have ES2015+ features other than `import` and `export`. What an irony.

## module

Now the name `jsnext:main` is too confusing. I was confused at least. People discussed for a better name, and [`module`](https://github.com/rollup/rollup/wiki/pkg.module) came out that [supersedes `jsnext:main`](https://github.com/rollup/rollup/wiki/jsnext:main). And [it might be standardized](https://nodesource.com/blog/es-modules-and-node-js-hard-choices/).

## So?

I looked into a couple of popular repos, and they had both of `jsnext:main` and `module` in addition to `main`.

- [redux](https://github.com/reactjs/redux/blob/master/package.json)
- [three.js](https://github.com/mrdoob/three.js/blob/dev/package.json)

At this time, it seems to be a good idea to have both of them if you want to support tree shaking. If you don't, just go with only the plain old `main`.
