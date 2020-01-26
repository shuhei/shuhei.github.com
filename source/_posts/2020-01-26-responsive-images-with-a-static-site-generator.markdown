---
layout: post
title: Responsive Images with a Static Site Generator
date: 2020-01-26 15:57
comments: true
categories: [JavaScript]
---

## Responsive images

An `img` without `width`/`height` attributes causes a page jump when it's loaded. It happens because the browser doesn't know the dimensions of the image until its data is loaded—only the first part that contains dimensions is enough though. It's common to specify `width` and `height` of `img` tag to avoid the jump.

```html
<img src="/images/foo.jpg" alt="Foo" width="800" height="600" />
```

But `img` tag with `width` and `height` doesn't always work well with Responsive Design because the dimensions are fixed. I wanted images to fit the screen width on mobile phones. So I left images without `width`/`height` and let them cause page jumps.

Recently, I came across a similar problem at work and learned a cool technique to create a placeholder of the image's aspect ratio with `padding-top`. If the image's aspect ratio is `height/width = 75/100`:

```html
<div style="position: relative; padding-top: 75%;">
  <img style="position: absolute; top: 0; left: 0; max-width: 100%;" />
</div>
```

The `div` works as a placeholder with the image's aspect ratio that fits the width of its containing element. Because the `img` tag has `position: absolute`, it doesn't cause a page jump when it's loaded.

I decided to implement it on this blog. This blog is made with a custom static site generator. I'm not sure if it's useful for anyone else, but I write how I did it anyway…

## Limiting overstretch

In addition to images that are wide enough to always fill the full width of the content area, I had images that are not wide enough to fill the full width of a laptop, but wide enough to fill the full width of a mobile phone. Not to stretch the image on laptops, I decided to go with another wrapper to limit the maximum width of the image. If the image's width is `500px`:

```html
<div style="max-width: 500px;">
  <div style="position: relative; padding-top: 75%;">
    <img style="position: absolute; top: 0; left: 0; max-width: 100%;" />
  </div>
</div>
```

## Getting Image Dimensions

The placeholder technique requires image dimensions. I used [image-size module](https://github.com/image-size/image-size) to get image dimensions.

The following function gets dimensions of images in a directory and returns them as a `Map`.

```js
const util = require("util");
const path = require("path");
const { promises: fs } = require("fs");
const sizeOf = util.promisify(require("image-size").imageSize);

async function readImageSizes(dir) {
  const files = (await fs.readdir(dir)).filter(f => !f.startsWith("."));
  const promises = files.map(async file => {
    const filePath = path.resolve(dir, file);
    const dimensions = await sizeOf(filePath);
    return [file, dimensions];
  });
  const entries = await Promise.all(promises);
  return new Map(entries);
}
```

## Custom renderer of Marked

This blog's posts are written in Markdown, and its static site generator uses [marked](https://github.com/markedjs/marked) to convert Markdown into HTML. One of my favorite things about `marked` is that we can easily customize its behavior with a custom renderer.

I used `span` tags to wrap `img` tag because they are rendered in `p` tag, which can't contain block tags like `div`.

```js
class CustomRenderer extends marked.Renderer {
  image(src, title, alt) {
    const dimensions = this.imageDimensions && this.imageDimensions.get(src);
    if (dimensions) {
      const { width, height } = dimensions;
      const aspectRatio = (height / width) * 100;
      return (
        `<span class="responsive-image-wrapper" style="max-width: ${width}px;">` +
        `<span class="responsive-image-inner" style="padding-top: ${aspectRatio}%;">` +
        `<img class="responsive-image" src="${src}" alt="${alt}">` +
        "</span>" +
        "</span>"
      );
    }
    return super.image(src, title, alt);
  }

  // To set images dimensions when images are changed
  setImageDimensions(imageDimensions) {
    this.imageDimensions = imageDimensions;
  }
}
```

And CSS:

```css
.responsive-image-wrapper {
  display: block;
}
.responsive-image-inner {
  display: block;
  position: relative;
}
.responsive-image {
  position: absolute;
  top: 0;
  left: 0;
}
```

## Result

Here are a few examples:

- [Full width on laptop and mobile](http://localhost:4000/blog/2019/12/31/2019-in-review/)
- [Full width on mobile but not on laptop](http://localhost:4000/blog/2010/07/10/surface/)

Yay, no more page jump! Well, web fonts still make the page slightly jump, but that's another story...

I skipped some details that are specific to my website. The full code is [on GitHub](https://github.com/shuhei/shuhei.github.com/pull/45).
