import { obj as through } from 'through2';

export default function (child) {
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
