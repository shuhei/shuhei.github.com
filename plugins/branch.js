var through = require('through2').obj;
var gutil = require('gulp-util');

module.exports = function (child) {
  function transform(file, enc, cb) {
    var clone = file.clone();
    clone.frontMatter = file.frontMatter;

    child.write(clone);

    this.push(file);
    cb();
  }

  function flush(cb) {
    child.end();
    cb();
  }

  return through(transform, flush);
};
