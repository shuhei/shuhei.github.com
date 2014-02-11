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
  title: 'Blog',
  author: 'Shuhei Kagawa'
};

gulp.task('copy', function () {
  gulp.src(['./source/**/*', '!./source/_*/**/*'])
      .pipe(plumber())
      .pipe(frontMatter())
      .pipe(condition(__dirname + '/source/**/*.{markdown,md}', markdown()))
      .pipe(blog.layout(blogConfig))
      .pipe(gulp.dest('./public'));
});

gulp.task('posts', function () {
  var aggregator = blog.index(blogConfig);
  aggregator.pipe(gulp.dest('./public/blog'));

  gulp.src('./source/_posts/*.*')
      .pipe(plumber())
      .pipe(frontMatter())
      .pipe(condition(__dirname + '/source/**/*.{markdown,md}', markdown()))
      .pipe(condition(__dirname + '/source/**/*.textile', textile()))
      .pipe(blog.cleanUrl())
      .pipe(branch(aggregator))
      .pipe(blog.layout(blogConfig))
      .pipe(gulp.dest('./public/blog'));
});

gulp.task('css', function () {
  gulp.src('./source/_css/**/*.css')
      .pipe(plumber())
      .pipe(concat('style.css'))
      .pipe(gulp.dest('./public/css'));
});

gulp.task('watch', ['default'], function () {
  server('./public').listen(4000, function (err) {
    if (err) return gutil.log(err);
    gulp.watch(['./source/**/*.*', '!./source/_{css,posts}/**/*.*'], ['copy']);
    gulp.watch('./source/_{posts,layout}/*.*', ['posts']);
    gulp.watch('./source/_css/**/*.css', ['css']);
  });
});

gulp.task('default', ['css', 'copy', 'posts']);
