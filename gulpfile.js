var util = require('util');
var path = require('path');

var args = require('yargs').argv;
var strftime = require('strftime');

var gulp = require('gulp');
var gutil = require('gulp-util');
var concat = require('gulp-concat');
var plumber = require('gulp-plumber');
var markdown = require('gulp-markdown');
var frontMatter = require('gulp-front-matter');
var textile = require('gulp-textile');
var clean = require('gulp-clean');
var shell = require('gulp-shell');

var condition = require('./plugins/condition');
var server = require('./plugins/server');
var blog = require('./plugins/blog');
var branch = require('./plugins/branch');

var blogConfig = {
  title: 'Blog',
  author: 'Shuhei Kagawa',
  perPage: 3,
  newPageExtension: 'markdown',
  publicDir: 'public',
  deployDir: '_deploy'
};

// Copy static pages compiling markdown files.
gulp.task('copy', function() {
  return gulp.src(['source/**/*', '!source/_*', '!source/_*/**/*', 'source/.nojekyll'])
    .pipe(plumber())
    // frontMatter messes up binary files and files with `---`.
    .pipe(condition(process.cwd() + '/source/**/*.{markdown,md,textile}', frontMatter()))
    .pipe(condition(process.cwd() + '/source/**/*.{markdown,md}', markdown()))
    .pipe(blog.layout(blogConfig))
    .pipe(gulp.dest(blogConfig.publicDir));
});

// Compile blog posts, create index and archive pages.
gulp.task('posts', function() {
  var aggregator = blog.index(blogConfig);
  aggregator.pipe(gulp.dest('./public/blog'));

  return gulp.src('source/_posts/*.*')
    .pipe(plumber())
    .pipe(frontMatter())
    .pipe(condition(__dirname + '/source/**/*.{markdown,md}', markdown()))
    .pipe(condition(__dirname + '/source/**/*.textile', textile()))
    .pipe(blog.cleanUrl())
    .pipe(branch(aggregator))
    .pipe(blog.layout(blogConfig))
    .pipe(gulp.dest('./public/blog'));
});

// Concat CSS files.
gulp.task('css', function() {
  return gulp.src('./source/_css/**/*.css')
    .pipe(plumber())
    .pipe(concat('style.css'))
    .pipe(gulp.dest('./public/css'));
});

// Build the site, launch a dev server and watch changes.
gulp.task('watch', ['default'], function() {
  server('./public').listen(4000, function(err) {
    if (err) return gutil.log(err);
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
  return blog.newPost(args.title);
});

// Create a new page source file.
gulp.task('newpage', function() {
  if (!args.filename) {
    gutil.log('Specify filename: gulp newpage --filename "hello"');
    return;
  }

  return blog.newPage(args.filename, blogConfig);
});

// Pull remote changes to the deploy dir.
gulp.task('pull', shell.task('git pull', { cwd: blogConfig.deployDir }));

// Remove non-dot files and directories in the deploy dir.
gulp.task('clean_deploy', ['pull'], function() {
  return gulp.src(path.join(blogConfig.deployDir, '**/*'), { dot: false, read: false })
    .pipe(clean());
});

// Copy all files including dot files in public dir to deploy dir.
gulp.task('copy_to_deploy', ['clean_deploy'], function() {
  return gulp.src(path.join(blogConfig.publicDir, '**/*'), { dot: true })
    .pipe(gulp.dest(blogConfig.deployDir));
});

// Push to GitHub Pages.
gulp.task('deploy', ['build', 'copy_to_deploy'], function() {
  var utcTime = strftime.strftimeTZ('%F %T UTC', new Date(), '0000');
  var commit = util.format('git commit -m "Site updated at %s"', utcTime);
  // FIXME: Not sure why but strange file names are ocasionally added.
  return gulp.src('')
    .pipe(shell([
      'git add -A',
      commit,
      'git push origin master'
    ], { cwd: blogConfig.deployDir }));
});

gulp.task('build', ['css', 'copy', 'posts']);

gulp.task('default', ['build']);
