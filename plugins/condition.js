import { obj as through } from 'through2';
import match from 'gulp-match';

export default function (condition, child, branch) {
  function transform(file, enc, cb) {
    if (match(file, condition)) {
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
