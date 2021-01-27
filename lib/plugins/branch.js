const { obj: through } = require("through2");

// Create a transform stream that writes cloned objects into the given writable stream.
function branch(child) {
  function transform(file, enc, cb) {
    const clone = file.clone();
    // Explicitly copy `frontMatter`. Otherwise it's not cloned.
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
