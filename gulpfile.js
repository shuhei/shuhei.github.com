var gulp = require('gulp');
var gutil = require('gulp-util');
var condition = require('gulp-if');
var plumber = require('gulp-plumber');
var markdown = require('gulp-markdown');

var frontmatter = require('./frontmatter');
var server = require('./server');

gulp.task('copy', function () {
  gulp.src(['./source/**/*.*', '!./source/_*/**/*.*'])
      .pipe(gulp.dest('./dist'));
});

gulp.task('posts', function () {
  // TODO: Support textile.
  gulp.src('./source/_posts/*.{markdown,md}')
      .pipe(plumber())
      .pipe(frontmatter())
      .pipe(markdown())
      // TODO: Add layout.
      // TODO: Change file name.
      .pipe(gulp.dest('./dist/blog'));
});

gulp.task('watch', function () {
  server('./dist').listen(4000, function (err) {
    if (err) return gutil.log(err);
    gulp.watch('./source/_posts/*.markdown', ['posts']);
  });
});

gulp.task('default', ['posts', 'copy']);
