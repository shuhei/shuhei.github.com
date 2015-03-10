var util = require('util');
var path = require('path');

var args = require('yargs').argv;
var strftime = require('strftime');
var del = require('del');
var highlightjs = require('highlight.js');

var gulp = require('gulp');
var gutil = require('gulp-util');
var concat = require('gulp-concat');
var plumber = require('gulp-plumber');
var markdown = require('gulp-markdown');
var frontMatter = require('gulp-front-matter');
var textile = require('gulp-textile');

var condition = require('./plugins/condition');
var server = require('./plugins/server');
var blog = require('./plugins/blog');
var branch = require('./plugins/branch');

var blogConfig = {
  title: 'Shuhei Kagawa',
  author: 'Shuhei Kagawa',
  perPage: 3,
  newPageExtension: 'markdown',
  blogDir: 'blog',
  sourceDir: 'source',
  layoutDir: '_layouts',
  postDir: '_posts'
};

var deployDir = '_deploy';
var publicDir = 'public';

function highlight(code) {
  return highlightjs.highlightAuto(code).value;
}

// Copy static pages compiling markdown files.
gulp.task('copy', function() {
  return gulp.src(['source/**/*', '!source/_*', '!source/_*/**/*', 'source/.nojekyll'])
    .pipe(plumber())
    // frontMatter messes up binary files and files with `---`.
    .pipe(condition(process.cwd() + '/source/**/*.{markdown,md,textile}', frontMatter()))
    .pipe(condition(process.cwd() + '/source/**/*.{markdown,md}', markdown({ highlight: highlight })))
    .pipe(blog.layout(blogConfig))
    .pipe(gulp.dest(publicDir));
});

// Compile blog posts, create index and archive pages.
gulp.task('posts', function() {
  var aggregator = blog.index(blogConfig);
  aggregator.pipe(gulp.dest('./public'));

  return gulp.src('source/_posts/*.*')
    .pipe(plumber())
    .pipe(frontMatter())
    .pipe(condition(__dirname + '/source/**/*.{markdown,md}', markdown({ highlight: highlight })))
    .pipe(condition(__dirname + '/source/**/*.textile', textile()))
    .pipe(blog.cleanUrl())
    .pipe(branch(aggregator))
    .pipe(blog.layout(blogConfig))
    .pipe(gulp.dest(path.join('./public', blogConfig.blogDir)));
});

// Concat CSS files.
gulp.task('css', function() {
  return gulp.src(['./source/_css/**/*.css', './node_modules/highlight.js/styles/default.css'])
    .pipe(plumber())
    .pipe(concat('style.css'))
    .pipe(gulp.dest('./public/css'));
});

gulp.task('clean', function(cb) {
  del([publicDir], cb);
});

// Build the site, launch a dev server and watch changes.
gulp.task('watch', ['default'], function() {
  server('./public').listen(4000, function(err) {
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
gulp.task('newpost', function() {
  if (!args.title) {
    gutil.log('Specify title: gulp newpost --title "Hello World"');
    return;
  }
  return blog.newPost(args.title, blogConfig);
});

// Create a new page source file.
gulp.task('newpage', function() {
  if (!args.filename) {
    gutil.log('Specify filename: gulp newpage --filename "hello"');
    return;
  }

  return blog.newPage(args.filename, blogConfig);
});

gulp.task('build', ['css', 'copy', 'posts']);

gulp.task('default', ['build']);
