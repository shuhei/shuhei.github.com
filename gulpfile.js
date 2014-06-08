var gulp = require('gulp');
var gutil = require('gulp-util');
var concat = require('gulp-concat');
var plumber = require('gulp-plumber');
var markdown = require('gulp-markdown');
var frontMatter = require('gulp-front-matter');
var textile = require('gulp-textile');

var args = require('yargs').argv;
var util = require('util');

var condition = require('./plugins/condition');
var server = require('./plugins/server');
var blog = require('./plugins/blog');
var branch = require('./plugins/branch');
var ghpage = require('./plugins/ghpage');

var blogConfig = {
  title: 'Blog',
  author: 'Shuhei Kagawa',
  perPage: 3,
  newPageExtension: 'markdown',
  publicDir: 'public',
  deployDir: '_deploy'
};

gulp.task('copy', function() {
  return gulp.src(['./source/**/*', '!./source/_*/**/*'])
    .pipe(plumber())
    // frontMatter messes up binary files and files with `---`.
    .pipe(condition(process.cwd() + '/source/**/*.{markdown,md,textile}', frontMatter()))
    .pipe(condition(process.cwd() + '/source/**/*.{markdown,md}', markdown()))
    .pipe(blog.layout(blogConfig))
    .pipe(gulp.dest(blogConfig.deployDir));
});

gulp.task('posts', function() {
  var aggregator = blog.index(blogConfig);
  aggregator.pipe(gulp.dest('./public/blog'));

  return gulp.src('./source/_posts/*.*')
    .pipe(plumber())
    .pipe(frontMatter())
    .pipe(condition(__dirname + '/source/**/*.{markdown,md}', markdown()))
    .pipe(condition(__dirname + '/source/**/*.textile', textile()))
    .pipe(blog.cleanUrl())
    .pipe(branch(aggregator))
    .pipe(blog.layout(blogConfig))
    .pipe(gulp.dest('./public/blog'));
});

gulp.task('css', function() {
  return gulp.src('./source/_css/**/*.css')
    .pipe(plumber())
    .pipe(concat('style.css'))
    .pipe(gulp.dest('./public/css'));
});

gulp.task('watch', ['default'], function() {
  server('./public').listen(4000, function(err) {
    if (err) return gutil.log(err);
    gutil.log('Listening on port 4000');
    gulp.watch(['./source/**/*.*', '!./source/_{css,posts}/**/*.*'], ['copy']);
    gulp.watch('./source/_{posts,layout}/*.*', ['posts']);
    gulp.watch('./source/_css/**/*.css', ['css']);
  });
});

gulp.task('newpost', function() {
  if (!args.title) {
    gutil.log('Specify title: gulp newpost --title "Hello World"');
    return;
  }
  return blog.newPost(args.title);
});

gulp.task('newpage', function() {
  if (!args.filename) {
    gutil.log('Specify filename: gulp newpage --filename "hello"');
    return;
  }

  return blog.newPage(args.filename, blogConfig);
});

gulp.task('copydot', function() {
  return ghpage.copyDot('source', 'hello');
});

gulp.task('push', function() {
  return ghpage.push(blogConfig);
});

gulp.task('default', ['css', 'copy', 'posts']);
