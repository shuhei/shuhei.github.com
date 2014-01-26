var gulp = require('gulp');
var gutil = require('gulp-util');
var condition = require('gulp-if');
var plumber = require('gulp-plumber');
var markdown = require('gulp-markdown');

var frontmatter = require('./frontmatter');
var server = require('./server');
var blog = require('./blog');

var blogConfig = {
  title: 'Blog!',
  author: 'Shuhei Kagawa'
};

gulp.task('copy', function () {
  gulp.src(['./source/**/*.*', '!./source/_*/**/*.*'])
      .pipe(gulp.dest('./public'));
});

gulp.task('posts', function () {
  // TODO: Support textile.
  gulp.src('./source/_posts/*.{markdown,md}')
      .pipe(plumber())
      .pipe(frontmatter())
      .pipe(markdown())
      .pipe(blog.cleanUrl())
      .pipe(blog.layout(blogConfig))
      .pipe(gulp.dest('./public/blog'))
      .pipe(blog.index(blogConfig))
      .pipe(gulp.dest('./public/blog'))
      // TODO: Create archive.
});

gulp.task('watch', ['copy', 'posts'], function () {
  server('./public').listen(4000, function (err) {
    if (err) return gutil.log(err);
    gulp.watch('./source/**/*', ['posts']);
  });
});

gulp.task('default', ['posts', 'copy']);
