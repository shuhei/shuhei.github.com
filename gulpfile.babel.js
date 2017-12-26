import path from 'path';

import { argv as args } from 'yargs';
import del from 'del';
import highlightjs from 'highlight.js';
import { Renderer } from 'marked';
import webpack from 'webpack';

import gulp from 'gulp';
import gutil from 'gulp-util';
import plumber from 'gulp-plumber';
import markdown from 'gulp-markdown';
import frontMatter from 'gulp-front-matter';
import textile from 'gulp-textile';

import webpackDevConfig from './webpack.dev';
import webpackProductionConfig from './webpack.production';
import condition from './plugins/condition';
import server from './plugins/server';
import { index, layout, cleanUrl, newPost, newPage } from './plugins/blog';
import branch from './plugins/branch';

import siteConfig from './source/_config/site.json';

const publicDir = 'public';

const renderer = new Renderer();
// Add `hljs` class to code blocks.
// https://github.com/chjj/marked/pull/418
renderer.code = (code, language) => {
  const extension = (language || '').split('.').pop();
  const isValidLang = !!(extension && highlightjs.getLanguage(extension));
  const highlighted = isValidLang ? highlightjs.highlight(extension, code).value : code;
  const filename = extension && extension !== language ?
    `<div><span class="code__filename">${language}</span></div>` :
    '';
  return `<pre><code class="hljs ${extension}">${filename}${highlighted}</code></pre>`;
};
// Responsive table
// https://www.w3schools.com/howto/howto_css_table_responsive.asp
renderer.table = (header, body) => {
  const table = Renderer.prototype.table.call(this, header, body);
  return `<div class="table-wrapper">${table}</div>`;
};

// Copy static pages compiling markdown files.
gulp.task('copy', () =>
  gulp.src(['source/**/*', '!source/_*', '!source/_*/**/*', 'source/.nojekyll'])
    .pipe(plumber())
    // frontMatter messes up binary files and files with `---`.
    .pipe(condition(`${process.cwd()}/source/**/*.{markdown,md,textile}`, frontMatter()))
    .pipe(condition(`${process.cwd()}/source/**/*.{markdown,md}`, markdown({ renderer })))
    .pipe(layout(siteConfig))
    .pipe(gulp.dest(publicDir))
);

// Compile blog posts, create index and archive pages.
gulp.task('posts', () => {
  // Aggregates posts and render index and archive pages.
  const aggregator = index(siteConfig);
  aggregator.pipe(gulp.dest('./public'));

  return gulp.src('source/_posts/*.{markdown,textile}')
    .pipe(plumber())
    .pipe(frontMatter())
    .pipe(condition(`${__dirname}/source/**/*.{markdown,md}`, markdown({ renderer })))
    .pipe(condition(`${__dirname}/source/**/*.textile`, textile()))
    .pipe(cleanUrl())
    .pipe(branch(aggregator))
    .pipe(layout(siteConfig))
    .pipe(gulp.dest(path.join('./public', siteConfig.blogDir)));
});

// Build JavaScript for client.
gulp.task('js', (callback) => {
  const config = process.env.NODE_ENV === 'production' ? webpackProductionConfig : webpackDevConfig;
  webpack(config, (err, stats) => {
    if (err) {
      throw new gutil.PluginError('webpack', err);
    }
    gutil.log('[webpack]', stats.toString('minimal'));
    callback();
  });
});

gulp.task('clean', (cb) => {
  del([publicDir], cb);
});

// Build the site, launch a dev server and watch changes.
gulp.task('watch', ['default'], () => {
  server('./public').listen(4000, (err) => {
    if (err) {
      gutil.log(err);
      return;
    }
    gutil.log('Listening on port 4000');
    gulp.watch(['./source/**/*.*', '!./source/_{js,css,posts}/**/*.*'], ['copy']);
    gulp.watch('./source/_{posts,layouts,css}/*.*', ['posts', 'copy']);
    gulp.watch('./source/_{js,layouts}/**/*.js', ['js']);
  });
});

// Create a new post source file.
gulp.task('newpost', () => {
  if (!args.title) {
    gutil.log('Specify title: gulp newpost --title "Hello World"');
    return;
  }
  newPost(args.title, siteConfig);
});

// Create a new page source file.
gulp.task('newpage', () => {
  if (!args.filename) {
    gutil.log('Specify filename: gulp newpage --filename "hello"');
    return;
  }

  newPage(args.filename, siteConfig);
});

gulp.task('build', ['js', 'copy', 'posts']);

gulp.task('default', ['build']);
