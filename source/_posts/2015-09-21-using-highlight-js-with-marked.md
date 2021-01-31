---
layout: post
title: "Using highlight.js with marked"
date: 2015-09-21
tags: [JavaScript]
---

I use [marked](https://github.com/chjj/marked) to parse markdown files of posts and pages, and [highlight.js](https://github.com/isagalaev/highlight.js) to highlight code blocks in them for this site. Here are problems that I came across to make them work together and a workaround for them.

marked's README has [an example on how to configure it to work with highlight.js](https://github.com/chjj/marked#highlight) but it doesn't add `hljs` classes on `<code>` tags that highlight.js uses to style code blocks. At the moment, you have to [prepare your own renderer](https://github.com/chjj/marked/pull/418#issuecomment-57291402) to achieve it.

Also, you need to check whether the language given by marked is a valid one for highlight.js. [highlight.js seems to have had `LANGUAGES` property a few years ago](https://github.com/chjj/marked/issues/311#issuecomment-31182632) but now `getLanguage()` method serves as a substitute for it.

Here's the outcome:

```js
import marked, { Renderer } from 'marked';
import highlightjs from 'highlight.js';

const escapeMap = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
};

function escapeForHTML(input) {
  return input.replace(/([&<>'"])/g, char => escapeMap[char]);
}

// Create your custom renderer.
const renderer = new Renderer();
renderer.code = (code, language) => {
  // Check whether the given language is valid for highlight.js.
  const validLang = !!(language && highlightjs.getLanguage(language));

  // Highlight only if the language is valid.
  // highlight.js escapes HTML in the code, but we need to escape by ourselves
  // when we don't use it.
  const highlighted = validLang
    ? highlightjs.highlight(language, code).value
    : escapeForHTML(code);

  // Render the highlighted code with `hljs` class.
  return `<pre><code class="hljs ${language}">${highlighted}</code></pre>`;
};

// Set the renderer to marked.
marked.setOptions({ renderer });
```

**EDIT on Feb 24, 2019:** The code snippet above was originally meant to be used for this blog and didn't have proper XSS protection for handling user inputs. Oleksii pointed out in a comment that it was vulnerable to XSS when `language` was not specified. I fixed the issue by escaping `code` for HTML. Thanks a lot, Oleksii!
