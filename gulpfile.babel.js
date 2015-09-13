import util from 'util';
import path from 'path'

import { argv } from 'yargs';
import strftime from 'strftime';
import del from 'del';
import highlightjs from 'highlight.js';

import gulp from 'gulp';
import gutil from 'gulp-util';
import concat from 'gulp-concat';
import plumber from 'gulp-plumber';
import markdown from 'gulp-markdown';
import frontMatter from 'gulp-front-matter';
import textile from 'gulp-textile';

import condition from './plugins/condition';
import server from './plugins/server';
import { index, layout, cleanUrl, newPost, newPage } from './plugins/blog';
import branch from './plugins/branch';

const blogConfig = {
  title: 'Shuhei Kagawa',
  author: 'Shuhei Kagawa',
  perPage: 3,
  newPageExtension: 'markdown',
  blogDir: 'blog',
  sourceDir: 'source',
  layoutDir: '_layouts',
  postDir: '_posts'
};

const deployDir = '_deploy';
const publicDir = 'public';

function highlight(code) {
  return highlightjs.highlightAuto(code).value;
}

// Copy static pages compiling markdown files.
gulp.task('copy', () => {
  return gulp.src(['source/**/*', '!source/_*', '!source/_*/**/*', 'source/.nojekyll'])
    .pipe(plumber())
    // frontMatter messes up binary files and files with `---`.
    .pipe(condition(process.cwd() + '/source/**/*.{markdown,md,textile}', frontMatter()))
    .pipe(condition(process.cwd() + '/source/**/*.{markdown,md}', markdown({ highlight: highlight })))
    .pipe(layout(blogConfig))
    .pipe(gulp.dest(publicDir));
});

// Compile blog posts, create index and archive pages.
gulp.task('posts', () => {
  const aggregator = index(blogConfig);
  aggregator.pipe(gulp.dest('./public'));

  return gulp.src('source/_posts/*.*')
    .pipe(plumber())
    .pipe(frontMatter())
    .pipe(condition(__dirname + '/source/**/*.{markdown,md}', markdown({ highlight: highlight })))
    .pipe(condition(__dirname + '/source/**/*.textile', textile()))
    .pipe(cleanUrl())
    .pipe(branch(aggregator))
    .pipe(layout(blogConfig))
    .pipe(gulp.dest(path.join('./public', blogConfig.blogDir)));
});

// Concat CSS files.
gulp.task('css', () => {
  return gulp.src(['./source/_css/**/*.css', './node_modules/highlight.js/styles/default.css'])
    .pipe(plumber())
    .pipe(concat('style.css'))
    .pipe(gulp.dest('./public/css'));
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
    gulp.watch(['./source/**/*.*', '!./source/_{css,posts}/**/*.*'], ['copy']);
    gulp.watch('./source/_{posts,layout}/*.*', ['posts']);
    gulp.watch('./source/_css/**/*.css', ['css']);
  });
});

// Create a new post source file.
gulp.task('newpost', () => {
  if (!args.title) {
    gutil.log('Specify title: gulp newpost --title "Hello World"');
    return;
  }
  return newPost(args.title, blogConfig);
});

// Create a new page source file.
gulp.task('newpage', () => {
  if (!args.filename) {
    gutil.log('Specify filename: gulp newpage --filename "hello"');
    return;
  }

  return newPage(args.filename, blogConfig);
});

gulp.task('build', ['css', 'copy', 'posts']);

gulp.task('default', ['build']);
