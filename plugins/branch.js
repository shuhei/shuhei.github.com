const { obj: through } = require("through2");

function branch(child) {
  function transform(file, enc, cb) {
    const clone = file.clone();
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
}

module.exports = branch;
