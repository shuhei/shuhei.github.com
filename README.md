# My Personal Website

https://shuheikagawa.com

This static website started as an [Octopress](https://github.com/octopress/octopress) blog. I re-wrote it using [Gulp](https://github.com/gulpjs/gulp), added and removed [React](https://github.com/facebook/react) server-side rendering. Currently, it's built with several custom Gulp plugins and rudimentary templates with JavaScript template literals.

This website doesn't load any client-side JavaScript except third parties (Google Analytics, Disqus and Speakerdeck) because it's not necessary to do so and I love fast websites.

## Setup

Prerequisites:

- [Node.js](https://nodejs.org/en/)

```sh
npm i -g yarn

git clone {this repo}
git checkout source

yarn
```

## Add posts and pages

To add a post:

```sh
yarn newpost 'Hello World!'
```

To add a page:

```sh
yarn newpage 'foo'
```

## Start a dev server

```sh
yarn start
```

## Deploy

GitHub Action deploys each push to the `source` branch to GitHub Pages.

To deploy manually:

```sh
yarn deploy
```

## Configuration

- hosting: GitHub Pages
- domain registrar: Google Domains
- DNS: Cloudflare
- CDN: Cloudflare

The domain `shuheikagawa.com` is resolved to IP addresses of Cloudflare CDN. Cloudflare CDN serves static contents whose origin is GitHub Pages.

Other services:

- blog comments: Disqus
- web fonts: Google Fonts
- analytics: Google Analytics
