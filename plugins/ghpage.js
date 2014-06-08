var path = require('path');
var exec = require('child_process').exec;
var util = require('util');
var stream = require('stream');

var gulp = require('gulp');
var gutil = require('gulp-util');
var clean = require('gulp-clean');
var async = require('async');
var strftime = require('strftime');

function logExec(command, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  exec(command, options, function(err, stdout, stderr) {
    if (stdout) {
      gutil.log(stdout);
    }
    if (stderr) {
      gutil.log(stderr);
    }
    callback(err);
  });
}

function copyDot(source, dest) {
  var src = path.join(source, '**/.*');
  var excluded = ["!**/.DS_Store", "!**/._*", "!**/.git", "!**/.gitignore"];
  return gulp.src([src].concat(excluded))
    .pipe(gulp.dest(dest));
}

function push(config) {
  var resultStream = new stream.Stream();

  gutil.log('## Deploying branch to Github Pages');

  function gitPull(callback) {
    gutil.log('## Pulling any updates from Github Pages');
    logExec('git pull', { cwd: config.deployDir }, callback);
  }

  // Remove non-dot files and directories in deploy dir.
  function cleanDeploy(callback) {
    gulp.src(path.join(config.deployDir, '**/*'), { dot: false, read: false })
      .pipe(clean())
      .on('error', function(err) { callback(err); })
      .on('end', function() { callback(); })
      .resume();
  }

  // Copy all files including dot files in public dir to deploy dir.
  function copyToDeploy(callback) {
    gutil.log(util.format('## Copying %s to %s', config.publicDir, config.deployDir));
    gulp.src(path.join(config.publicDir, '**/*'), { dot: true })
      .pipe(gulp.dest(config.deployDir))
      .on('error', function(err) { callback(err); })
      .on('end', function() { callback(); });
  }

  function add(callback) {
    logExec('git add -A', { cwd: config.deployDir }, callback);
  }

  function commit(callback) {
    var timestamp = utcTime();
    gutil.log(util.format('## Commiting: Site updated at %s', timestamp));
    var message = util.format('Site updated at %s', timestamp);
    logExec(util.format('git commit -m "%s"', message), { cwd: config.deployDir }, callback);
  }

  function gitPush(callback) {
    gutil.log(util.format('## Pushing generated %s website', config.deployDir));
    logExec('git push origin master', { cwd: config.deployDir }, callback);
  }

  function done(err) {
    if (err) {
      resultStream.emit('error', err);
      return;
    }

    resultStream.emit('end');
  }

  var tasks = [gitPull, cleanDeploy, copyToDeploy, add, commit, gitPush];
  async.series(tasks, done);

  return resultStream;
}

function utcTime() {
  return strftime.strftimeTZ('%F %T UTC', new Date(), '0000');
}

module.exports = {
  copyDot: copyDot,
  push: push
};
