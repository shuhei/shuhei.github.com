---
layout: post
title: "Angular 2 with Babel"
date: 2016-05-08
comments: true
categories: [JavaScript, Angular 2, Babel]
---

Although Angular 2's primary language is apparently TypeScript, many people want to use Babel as shown in [a survey](http://angularjs.blogspot.jp/2015/09/angular-2-survey-results.html).

However, [The official documentation](https://angular.io) targets only TypeScript and ES5. In addition, many pages are not yet available for ES5. That is because Angular 2 relies heavily on cutting-edge ES7 decorators and TypeScript's type annotations for annotating components and services.

To fill the gap, you can use [`babel-preset-angular2`](https://github.com/shuhei/babel-preset-angular2) that supports all the decorators and annotations available in TypeScript. With the preset, you can follow the official documentation for TypeScript to learn Angular 2 itself.

## How to use it

```sh
npm install -D babel-preset-es2015 babel-preset-angular2
```

Add `presets` to `.babelrc`. Note that the `presets`' order is important.

```json
{
  "presets": ["es2015", "angular2"]
}
```

See [`babel-angular2-app`](https://github.com/shuhei/babel-angular2-app) for more complete example.

## Supported annotations

| Name                | Example        | EcmaScript  | TypeScript | Babel*   | Babel + angular2 |
| ------------------- | -------------- | ----------- | ---------- | -------- | ---------------- |
| Class decorator     | `@Component()` | Stage 1     | Yes        | Yes      | Yes              |
| Property decorator  | `@Input()`     | Stage 1     | Yes        | Partial* | Yes              |
| Parameter decorator | `@Optional()`  | Stage 0     | Yes        | No       | Yes              |
| Type annotation     | `foo: Foo`     | -           | Yes        | No       | Yes              |

"Babel*" above means Babel with the following official plugins:
  - [babel-preset-es2015](https://babeljs.io/docs/plugins/preset-es2015/)
  - [babel-plugin-transform-class-properties](https://babeljs.io/docs/plugins/transform-class-properties/)
  - [babel-plugin-transform-decorators-legacy](https://github.com/loganfsmyth/babel-plugin-transform-decorators-legacy) (not literally official but maintained by [@loganfsmyth](https://github.com/loganfsmyth), one of Babel's core contributors)

Property decorator in Babel is marked "Partial" because `babel-plugin-transform-decorators-legacy` ignores class properties without initializers.

You can emulate parameter decorator and type annotation with plain ES2015 like the following but it's a little bit counterintuitive.

```js
class HelloComponent {
  constructor(foo: Foo, @Optional() bar: Bar) {
    // Do something with foo and bar.
  }
}

class HelloComponent {
  static get parameters() {
    return [[Foo], [Bar, Optional()]];
  }

  constructor(foo, bar) {
    // Do something with foo and bar.
  }
}
```

## Polyfills

Angular 2 beta versions had polyfill bundles but RC versions don't. But never mind. We can just import them before bootstrapping our app.

```sh
npm install -S babel-polyfill zone.js
```

`src/index.js`

```js
// Import polyfills.
import 'babel-polyfill';
import 'zone.js/dist/zone.js';

// Bootstrap app!
import {provide} from '@angular/core';
import {bootstrap} from '@angular/platform-browser-dynamic';
import {ROUTER_PROVIDERS} from '@angular/router';
import {LocationStrategy, HashLocationStrategy} from '@angular/common';

import {HelloApp} from './app';

bootstrap(HelloApp, [
  ROUTER_PROVIDERS,
  provide(LocationStrategy, { useClass: HashLocationStrategy })
]).catch(err => console.error(err));
```

Note that we can use `babel-polyfill` that includes `core-js` instead of `es6-shim` and `reflect-metadata`. According to [use core-js instead of es6-shim](https://github.com/angular/angular/issues/5755), we can use whatever ES6 + ES7 polyfill we like.

## Module resolution

You can use any module resolver as long as it works with Babel. I'll pick [Browserify](http://browserify.org/) here for its simplicity.

```js
npm install -D browserify babelify
```

Add a `build` script to your `package.json` assuming that your bootstrap script locates at `src/index.js`.

```json
{
  "scripts": {
    "build": "browserify -t babelify src/index > public/bundle.js"
  }
}
```

```sh
npm run build
```

Isn't this simple? `babelify` automatically finds your `.babelrc` and uses the presets specified above.

Of course you can use other module resolvers like Webpack or SystemJS.

## Offline compilation

This is not yet available for Babel. Not completed even for TypeScript.

The [`compiler_cli`](https://github.com/angular/angular/tree/master/modules/%40angular/compiler_cli) seems to be deeply integrated with TypeScript compiler. It **statically** collects metadata from the source and feed it to the compiler. I believe that it is achievable with Babel to do the same thing.

I'm thinking of working on it once the TypeScript version is published and the compiler API becomes more stable.

## Conclusion

I've presented how to use TypeScript-specific annotations in Babel. You can enjoy Angular 2 with your favorite transpiler.

See [`babel-angular2-app`](https://github.com/shuhei/babel-angular2-app) for more complete example.
