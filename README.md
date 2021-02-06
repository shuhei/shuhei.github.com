# My Personal Website

https://shuheikagawa.com

## Eleventy

This static website is built with [Eleventy](https://www.11ty.dev/).

### Blog posts

Blog post data and content are generated in the following chain:

1. The markdown files in `posts` provide the slug, title, content and optionally image (used for `og:image`).
2. `posts/posts.11tydata.js` specifies the layout and sets a generated `image` if not specified.
3. `_includes/post.njk` renders the post page content and sets a permalink.
4. `_includes/base.njk` render the entire content.
5. (content only) Transformers optimize the HTML and images.

Blog posts are collected as a custom collection called `posts`. I didn't use `tags` for blog posts collection because I wanted to show a list of tags on each page and it was tedious to ignore the `posts` tag there.

The `posts` collection is used for the following purposes:

- Render individual post pages.
- Render the all posts page with `blog/archives.njk`.
- Generate OG images with `blog/title-image.11ty.js`. This JavaScript template generates a PNG image for each post. The generated images are referenced with URLs by `posts/posts.11tydata.js`.

### Static assets

Static assets and non-markdown files are copied to the output directory by pass-through copy.

## Setup

Prerequisites:

- [Node.js](https://nodejs.org/en/)

```sh
npm i -g yarn

git clone {this repo}
git checkout source

yarn
```

## Add a new post

Create a new markdown file in the format of `YYYY-mm-dd-post-slug.md`.

The content should look like:

```
---
title: "Post title"
tags: [TagA, TagB]
---

Post content goes here.
```

## Start a dev server

```sh
yarn start
```

It will build files and start a dev server.

## Build

```sh
yarn build
```

It doesn't apply slow optimizations such as AVIF image format. In order to enable them:

```sh
OPTIMIZE=1 yarn build
```

## Deploy

GitHub Action deploys each push to the `source` branch to GitHub Pages.

To deploy manually:

```sh
yarn deploy
```

## Configuration

- hosting: GitHub Pages
- domain registrar: Cloudflare
- DNS: Cloudflare
- CDN: Cloudflare

The domain `shuheikagawa.com` is resolved to IP addresses of Cloudflare CDN. Cloudflare CDN serves static contents whose origin is GitHub Pages.

Other services:

- web fonts: Google Fonts
- analytics: Google Analytics

## History

This static website started as an [Octopress](https://github.com/octopress/octopress) blog. I re-wrote it using [Gulp](https://github.com/gulpjs/gulp), added and removed [React](https://github.com/facebook/react) server-side rendering. Currently, it's built with [Eleventy](https://www.11ty.dev/).
