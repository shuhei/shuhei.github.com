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

### EMFILE

If you get the following error, change ulimit like `ulimit -n 1024`.

```
$ gulp
[19:01:41] Using gulpfile ~/work/shuheikagawa.com/gulpfile.js
[19:01:41] Starting 'css'...
[19:01:41] Starting 'copy'...
[19:01:41] Starting 'posts'...

stream.js:94
      throw er; // Unhandled stream error in pipe.
            ^
Error: EMFILE, readdir '/Users/shuhei/work/shuheikagawa.com/source/works/radiation/css/custom-theme/images'
```

## Deploy

Deploy to GitHub Pages. Make sure to build before deployment!

```
gulp deploy
```
