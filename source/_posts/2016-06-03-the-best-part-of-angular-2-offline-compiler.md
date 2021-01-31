---
layout: post
title: "The best part of Angular 2 offline compiler"
tags: [JavaScript, Angular 2]
---

A couple of weeks ago, I gave a short talk about Angular offline compiler at [ng-sake #3](http://ng-sake.connpass.com/event/30746/), which is a cozy meetup where Tokyo's Angular developers hang out drinking beer.

<script async class="speakerdeck-embed" data-id="384a4e8ded2945fbaa5dc2054409bcb3" data-ratio="1.77777777777778" src="//speakerdeck.com/assets/embed.js"></script>

I won't write much about it here because it's still in its early stage and I couldn't make `@angular/compiler-cli` work without modification.

The only thing I want to stress here is that it enables us to **statically type-check our templates with TypeScript**, which is awesome. Templates have been one of the places where mistakes are made since Angular 1. Even if we introduce TypeScript or lint tools, we couldn't be able to detect mistakes in templates until they are evaluated at the runtime.

The steps would be the following:

1. Angular 2 offline compiler compiles templates into TypeScript files with `.ngfactory.ts` extension.
2. You prepare another bootstrap script that imports the root `.ngfactory.ts` and bootstraps your app with it.
3. TypeScript compiler compiles the bootstrap script, other TypeScript files and `.ngfactory.ts` files into JavaScript.

The step 3 type-checks `.ngfactory.ts`, and detects typo and type errors in your templates if any. It is a great benefit in addition to skipping the runtime compilation and smaller library size. Looking forward to Angular 2 offline compiler's official release!
