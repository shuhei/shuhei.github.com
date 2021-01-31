---
title: Goodbye, Textile
tags: [Blog, JavaScript]
---

[Textile](<https://en.wikipedia.org/wiki/Textile_(markup_language)>) is a markup language that is similar to Markdown. This blog had had posts written in Textile for more than a decade—I feel old now! I removed the Textile files last weekend. This post is a memoir on the markup language.

I started using Textile on a blog engine called [Textpattern](https://en.wikipedia.org/wiki/Textpattern). I don't remember exactly when, but probably around 2004 or 2005. I was a university student. Movable Type was the most popular blog engine at the time, but it changed its license towards a more commercial one. Textpattern was a new open-source software. I fell in love with its minimalism. There were not many Textpattern users in Japan. Information in Japanese was very little if not none. I read documentation and forums in English and translated some into Japanese with a few fellows whom I had never met in person.

After a few years, Wordpress became a thing, or I realized it did. Even after I moved to Wordpress, I kept writing in Textile. I liked editing Textile more than editing rich text on WYSIWYG editor. I am not sure whether I had heard of Markdown at the time. But it was not as popular or dominant as it is now.

I started this blog with Textile on Wordpress in 2008 when I started my first job. And I migrated it to Octopress in 2012. I started writing in Markdown with Octopress because it was the lingua franca of GitHub where all the cool things were happening. I had a bit more than a hundred posts in Textile. I kept them in Textile because Octopress supported Textile as well. In 2014, I rebuilt this blog with a handmade static site generator using Gulp. I carried the old Textile files over. I even wrote [gulp-textile](https://github.com/shuhei/gulp-textile) plugin, which was just a thin wrapper of [textile-js](https://github.com/borgar/textile-js). It was my first npm package.

Since then, I implemented a few Markdown-only features like syntax highlighting and responsive table in this blog. The outputs of Markdown and Textile diverged. Last weekend, I wanted to implement [responsive images](https://shuheikagawa.com/blog/2020/01/26/responsive-images-with-a-static-site-generator/). One more Markdown-only feature. Then I thought it was time to convert the Textile files to Markdown.

## Converting Textile to Markdown

I didn't want to convert a hundred posts by hand. I had tried [tomd](https://github.blog/2016-03-01-upgrading-your-textile-posts-to-markdown/) a few years ago, but I was not satisfied with the result. The old Textile files had raw HTML tags and some classes for styling. Also, I was afraid of missing some details that I don't remember anymore. So I decided to write a conversion script.

I used [textile-js](https://github.com/borgar/textile-js) to parse Textile. It turned out that `textile-js` output HTML string or [JsonML](http://www.jsonml.org/). JsonML was new to me. It is basically HTML in JSON format. Each text node is represented as a string. Each element node is represented as an array whose first item is the tag name, an optional second item is an object of attributes and the rest are child nodes.

```html
<a href="https://foo.com"><img src="foo.png" alt="Foo" /> Yay</a>
```

```json
[
  "a",
  { "href": "https://foo.com" },
  ["img", { "src": "foo.png", "alt": "Foo" }],
  " Yay"
]
```

I wrote a `switch` statement to handle tags and added tag handlers one by one.

```js
switch (tag) {
  case "img":
    return /* render <img> */;
  case "a":
    return /* render <a> */;
  default:
    throw new Error(`Unknown tag: ${tag}`);
}
```

I also added `console.log` for unknown attributes. In this way, I was able to make sure that all tags and attributes were handled. [The script worked well to convert more than one hundred posts](https://github.com/shuhei/shuhei.github.com/pull/44). The full script is [on Gist](https://gist.github.com/shuhei/b622af9559d859d386edbfe43f171d72).
