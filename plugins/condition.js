const { obj: through } = require('through2');
const minimatch = require('minimatch');

// TODO: Why don't you use gulp-if?
function condition(cond, child, branch) {
  function transform(file, enc, cb) {
    if (minimatch(file.path, cond)) {
      if (branch) {
        child.write(file);
        cb();
      } else {
        child.once('data', (data) => {
          this.push(data);
          cb();
        });
        child.write(file);
      }
      return;
    }

    this.push(file);
    cb();
  }

  function flush(cb) {
    child.once('end', cb);
    child.end();
  }

  return through(transform, flush);
}

module.exports = condition;
