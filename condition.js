var through = require('through2').obj;
var match = require('gulp-match');

module.exports = function (condition, child, branch) {
  function transform(file, enc, cb) {
    var self = this;

    if (match(file, condition)) {
      if (branch) {
        child.write(file);
        cb();
      } else {
        child.once('data', function (data) {
          self.push(data);
          cb();
        });
        child.write(file);
      }
      return;
    }

    self.push(file);
    cb();
  }
  function flush(cb) {
    child.once('end', cb);
    child.end();
  }
  return through(transform, flush);
};
