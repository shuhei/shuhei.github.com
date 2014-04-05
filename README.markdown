# My Personal Website

## Setup

```
git clone {this repo}
git checkout source
git submodule init
git submodule update

git clone {this repo} _deploy
```

## Build

Use `gulp` to build static files.

```
gulp
```

When writing articles or developing templates, watch file changes.

```
gulp watch
```

## Deploy

Deploy to GitHub Pages.

```
bundle exec rake push
```
