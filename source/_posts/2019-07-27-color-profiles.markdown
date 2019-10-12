---
layout: post
title: "Color Profiles"
date: 2019-07-27 19:13
comments: false
categories: [Image]
---

I can't recall why..., but in the summer of 2018, I wrote [a piece of code](https://github.com/shuhei/incomplete-image-parser) to parse binary data of images like JPEG, PNG and WebP. Probably just for fun. I checked images on Zalando with it, and stumbled upon a chunk named `ICC_PROFILE` in JPEG and `ICCP` in WebP.

Certain types of images had the color profile while others didn't. Is it really necessary? After some research on the internet, I found [Use sRGB instead of ICC color profiles - ImageOptim](https://imageoptim.com/color-profiles.html). It advises to convert images into sRGB and not to embed the color profile into images. So, it seemed to be unnecessary data that we could just remove. The other types of images didn't have it anyway. I wrote an issue about this extra 0.5KB on GitHub Enterprise, and I forgot...

This week, a colleague asked me if the issue is still the case. I checked. Yes, images still had the extra 0.5KB.

Because only certain types of images had the color profile and I was looking at wrong origin images, I thought that Akamai Image Manager was adding it. I asked in Google Chat at work and another colleague eventually opened a case to Akamai. After some back and forth with a representative of Akamai, I found that I was looking at wrong origin images that didn't have a color profile and the actual origin images had a color profile of about 3KB. It seemed that Akamai Image Manager converted the 3KB color profile into the 524 bytes one.

It turned out that the 524 bytes one was [TINYsRGB that Facebook engineers created](https://www.facebook.com/notes/facebook-engineering/under-the-hood-improving-facebook-photos/10150630639853920/). It works as same as sRGB, but smaller than the original one. Facebook and Instagram are still using it as of July 2019. (Someone optimized it further to [491 bytes](https://pippin.gimp.org/sRGBz/) and even [424 bytes](https://photosauce.net/blog/post/making-a-minimal-srgb-icc-profile-part-1-trim-the-fat-abuse-the-spec) later.) The origin images had 3KB sRGB color profile. Akamai Image Manager embeds the 524 bytes TINYsRGB instead of the 3KB one. This is a great optimization.

But can't we just remove the sRGB color profile? Before answering this question, I had to learn why the color profile was necessary at all...

## Why is the color profile for?

The stackoverflow answer has a good metaphor. An image file says "50% of the maximum speed". But what is the maximum speed? That's what color spaces specify. If sRGB says the maximum speed is 100km/h, the specified value is 50km/h. Cool. The output is same. To show a color on a monitor, we need to tell how much percentage of the monitor's maximum speed instead of the absolute speed like 50km/h. So, the browsers need to know the maximum speed of the monitor to calculate the percentage. If the monitor's maximum speed is 200km/h, 50km/h is 25%.

## Color Management on the Web

Color management for browsers means color transformation from the input color space into the output color space. This is not necessary if the color spaces of the input and the output are same or very similar. When most images on the web were in sRGB, and most monitors had color profiles very similar to sRGB, the transformation wouldn't be necessary.

Targets:

1. Tagged images (images with embedded color profiles)
2. Untagged images (images without embedded color profiles)
3. DOM elements with CSS colors

The last two are often treated in the same way.

Browser Support:

- Read tagged images and transform colors from sRGB to monitor's color space
- Assume CSS colors and untagged images as sRGB and transform colors from sRGB to monitor's color space

To show proper colors on wide-gamut monitors, browsers need color management.

The latest versions of Chrome, Safari, Edge and Opera support color management of tagged images, untagged images as sRGB, and DOM elements as sRGB. Only Firefox doesn't enable color management on untagged images or DOM elements by default. It has an option called `gfx.color_management.mode`. If you set `1` to it, it enables color management on everything. But the default value is `2`, which applies color management only to tagged images.

## Media Query

Chrome, Safari and Opera support `color-gamut` media query.

```html
<picture>
  <source srcset="p3.jpeg" media="(color-gamut: p3)" />
  <img src="srgb.jpeg" />
</picture>
```

```js
window.matchMedia("(color-gamut: p3)").matches; // true or false
```

## Can we automate the check?

Probably yes on the OS level utility.

- TODO: What happens to Canvas?

Firefox 68 applies color management to `CanvasRenderingContext2D.drawImage()`. This means that we can check whether sRGB is used for untagged images or not.

- TODO: Can we put a color profile in data URL? Probably yes.

## Conclusion
