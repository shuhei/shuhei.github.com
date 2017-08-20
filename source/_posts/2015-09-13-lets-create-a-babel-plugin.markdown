---
layout: post
title: "Let's create a Babel plugin"
date: 2015-09-13 14:22
comments: true
categories: [JavaScript, Babel]
---

**[EDIT] This article was written for Babal 5.x, which is outdated now. I recommend [thejameskyle/babel-handbook](https://github.com/thejameskyle/babel-handbook/) as more up-to-date documentation.**

[Babel](https://babeljs.io/) is the great tool that transpiles ES2015, ES7, JSX and such into ES5 and make them available on the browsers. If you are a person like me, you might use it on a daily basis.

In addition to to [the built-in transformers](https://babeljs.io/docs/advanced/transformers/), you can add your own transpilation rules by employing third-party plugins. For example, I have been developing [a plugin that enables you to write Angular 2 apps with Babel](https://github.com/shuhei/babel-plugin-angular2-annotations) lately. It is easier to develop than you may think. Let me introduce how to create a plugin for Babel 5.x.

## How Babel works

Simply put, Babel works like the following:

1. Babylon, the parser of Babel, parses source code into AST.
2. Transformers transforms AST into another AST in sequence.
3. Generators generates JavaScript code from the final AST.

In the step 1, AST is for [Abstract Syntax Tree](https://en.wikipedia.org/wiki/Abstract_syntax_tree), which represents the structure of source code as a tree. Babel's AST is based on a specfication called ESTree and has some extensions for non-standard nodes like ES7+, JSX and flowtype. You can check the ESTree spec at the following links:

- [Core](https://github.com/estree/estree/blob/master/spec.md)
- [ES6](https://github.com/estree/estree/blob/master/es6.md)

In the step 2, transformers consists of [the built-in transformers](https://babeljs.io/docs/advanced/transformers/), like [es6.classes](es6.classes), and third-party plugin transformers. As of Babel 6.0, the built-in transpilers will also be extracted as external plugin modules. So there will be no border between the build-in and third-party plugins.

So, what you have to do is write a transformer that transforms AST into another AST. You don't need to parse JS or generate JS from AST by yourself. It will be greatly effective compared to introducing another tool that parses JS by its own. Also, Babel's powerful API will make it easier than using the raw esprima tools.

## What you can (not) do

You can do almost anything as long as it's in the syntax that Babylon supports, ES2015, ES7+, JSX, flowtype and etc. You can't introduce new syntax because Babel currently doesn't support parser extension by plugins. (You can actually accomplish it by monkey-patching Babylon though.)

## Create a project

Create a directory in the format of `babel-plugin-*`. The `*` part turns to be your plugin name. In the directory, you can create a Babel plugin project with `babel-plugin init`, which is installed by `npm install -g babel`.

```sh
# Prepare a project directory.
mkdir babel-plugin-foo-bar
cd babel-plugin-foo-bar
# Generate necessary files.
npm install -g babel
babel-plugin init
# Install dependencies.
npm install
```

The following structure should have been generated:

```
.
├── .gitignore
├── .npmigonore
├── LICENSE
├── README.md
├── node_modules
├── package.json
└── src
    └── index.js
```

You will find some npm-run-scripts in the `package.json`:

- `npm run build` transpiles files under `src` directory with Babel and output the result into `lib` directory.
- `npm run push` releases a newer version of the plugin. It takes care of git commit, tag and npm package.
- `npm test` runs `babel-plugin test` but fails because the command doesn't exist. [It seems like it will work in the future.](https://github.com/babel/babel/issues/1950) So, prepare your favorite test runner like `mocha` for now.

With this setup, you can write your plugin itself with Babel's features. `src` should be ignored in npm and `lib` in git.

## Transformer

`src/index.js`, the meat of the plugin, looks like this:

```js
/* eslint no-unused-vars:0 */
export default function ({ Plugin, types: t }) {
  return new Plugin("foo", {
    visitor: {
      // your visitor methods go here
    }
  });
}
```

It exports a factory function that creates a `Plugin` instance. The `Plugin` constructor gets the plugin's name and a configuration object.

The `visitor` property holds methods named as AST node types. A Babel transformer traverses AST from the top to the bottom. Each method is called when the trasnformer visits the matched nodes. For instance, you can manipulate class declarations and function declarations as the following:

```js
export default function ({ Plugin, types: t }) {
  return new Plugin("foo", {
    visitor: {
      ClassDeclaration(node, parent) {
        // Do something on a class declaration node.
      },
      FunctionDeclaration(node, parent) {
        // Do something on a function declaration node.
      }
    }
  });
};
```

You can also use `alias` instead of plain node types to match multiple node types. For example, `Function` matches against `FunctionDeclaration` and `FunctionExpression`.

`types` is another important thing. It contains a bunch of utility functions for AST manipulation.

- AST node generation functions such as `identifier()`, `memberExpression()` and `assignmentExpression`. Their names are lowerCamelCased versions of the corresponding node types. You can check their arguments at [definitions](https://github.com/babel/babel/tree/master/packages/babel/src/types/definitions)' `builder` properties.
- AST node check functions such as `isIdentifier()` and `isDecorator()`. You can shallowly check node properties with the second argument.

The functions are [generated](https://github.com/babel/babel/blob/v5.8.24/packages/babel/src/types/index.js) from [definitions](https://github.com/babel/babel/tree/master/packages/babel/src/types/definitions)。The definitions will serve as a reference.

The best examples of AST transformation using `types` functions are undoubtedly [the source code of the built-in transformers](https://github.com/babel/babel/tree/v5.8.24/packages/babel/src/transformation/transformers). Pick the closest one to what you want from [the list](https://babeljs.io/docs/advanced/transformers/) and check out the source code. [The official documentation](https://babeljs.io/docs/advanced/plugins/) will also help.

## Case study: Assign class constructor's arguments as instance properties

As a case study, I built a plugin called [babel-plugin-auto-assign](https://github.com/shuhei/babel-plugin-auto-assign) that "assigns class constructor's arguments as instance properties", which resembles TypeScript's parameter properties in its action. It is intended to be used with class-based dependency injection like Angular's.

To avoid unawarely messing up constructors, let's apply the transformation only to classes with a decrator called `@autoAssign`. `@autoAssign` is a so-called [ambient decorator](https://github.com/jonathandturner/brainstorming/blob/master/README.md#c6-ambient-decorators) because it should not appear in the output.

Before:

```js
@autoAssign
class Hello {
  constructor(foo, bar, baz) {
  }
}
```

After:

```js
class Hello {
  constructor(foo, bar, baz) {
    this.foo = foo;
    this.bar = bar;
    this.baz = baz;
  }
}
```

Note that we can leave the ES6 class as is because it's going to be transformed to ES5 by the subsequent built-in transformers. Babel plugin transformers are applied **before** the built-in transformers by default. If you want to apply a plugin after the built-in transformers, suffix the plugin name with `:after` like `babel --plugins foo:after index.js`.

## AST before/after transformation

To transform AST, we need to know how the starting post and the goal look like. You can visualize source code in AST parsed by Babylon with [Felix Kling's JS AST Explorer](http://felix-kling.de/esprima_ast_explorer).

- [Before transformation](http://felix-kling.de/esprima_ast_explorer/#/OuFSNzgCl2)
- [After transformation](http://felix-kling.de/esprima_ast_explorer/#/tZsOQTyns6)

It also works to examine nodes with `console.log()`.

## Code

Once you get the ASTs, half of the work is done. Let's write some code to insert AST nodes using `types` functions.

[The complete project](https://github.com/shuhei/babel-plugin-auto-assign) includes unit testing with fixtures.

`src/index.js`

```js
import AutoAssign from './auto-assign';

export default function ({ Plugin, types: t }) {
  return new Plugin('autoAssign', {
    visitor: {
      ClassDeclaration: function (node, parent) {
        new AutoAssign(t).run(node);
      }
    }
  });
}
```

`src/auto-assign.js`

```js
export default class AutoAssign {
  constructor(types) {
    this.types = types;
  }

  run(klass) {
    // Process only if `@autoAssign` decorator exists.
    const decorators = this.findautoAssignDecorators(klass);
    if (decorators.length > 0) {
      // Get constructor and its paremeters.
      const ctor = this.findConstructor(klass);
      const args = this.getArguments(ctor);
      // Prepend assignment statements to the constructor.
      this.prependAssignments(ctor, args);
      // Delete `@autoAssign`.
      this.deleteDecorators(klass, decorators);
    }
  }

  findautoAssignDecorators(klass) {
    return (klass.decorators || []).filter((decorator) => {
      return decorator.expression.name === 'autoAssign';
    });
  }

  deleteDecorators(klass, decorators) {
    decorators.forEach((decorator) => {
      const index = klass.decorators.indexOf(decorator);
      if (index >= 0) {
        klass.decorators.splice(index, 1);
      }
    });
  }

  findConstructor(klass) {
    return klass.body.body.filter((body) => {
      return body.kind === 'constructor';
    })[0];
  }

  getArguments(ctor) {
    return ctor.value.params;
  }

  prependAssignments(ctor, args) {
    const body = ctor.value.body.body;
    args.slice().reverse().forEach((arg) => {
      const assignment = this.buildAssignment(arg);
      body.unshift(assignment);
    });
  }

  buildAssignment(arg) {
    const self = this.types.identifier('this');
    const prop = this.types.memberExpression(self, arg);
    const assignment = this.types.assignmentExpression('=', prop, arg);
    return this.types.expressionStatement(assignment);
  }
}
```

## Run!

Use `--optional es7.decorators` option in order to support decorators. You can specify plugins by file path in addition to plugin name, which is convenient for development.

```
npm run build
echo '@autoAssign class Hello { constructor(foo, bar, baz) {} }' | babel --optional es7.decorators --plugins ./lib/index.js
```

Here comes the result!

```js
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Hello = (function () {
  function Hello(foo, bar, baz) {
    _classCallCheck(this, _Hello);

    this.foo = foo;
    this.bar = bar;
    this.baz = baz;
  }

  var _Hello = Hello;
  return Hello;
})();
```

## Publish

After you write README and commit it, you can publish your plugin to the world by `npm run push`.

Let's create awesome babel plugins!

## References

### Documentation

- [Plugins - Babel](https://babeljs.io/docs/advanced/plugins/)
- [ESTree](https://github.com/estree/estree)
- [Built-in transformers](https://github.com/babel/babel/tree/v5.8.24/packages/babel/src/transformation/transformers)

### Projects

- [shuhei/babel-plugin-auto-assign](https://github.com/shuhei/babel-plugin-auto-assign) The case study project in this article.
- [shuhei/babel-plugin-angular2-annotations](https://github.com/shuhei/babel-plugin-angular2-annotations) A plugin for building Angular 2 app with Babel. It supports TypeScript-like method parameter decorators by monkey-patching Babylon.
