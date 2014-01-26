var through = require('through2').obj;
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var yaml = require('js-yaml');

var SEPARATOR = '---';

function transform(file, enc, cb) {
  var self = this;

  function doNothing() {
    self.push(file);
    cb();
  }

  function emitError(message) {
    var error = new PluginError('frontmatter', message);
    self.emit('error', error);
  }

  if (file.isNull()) {
    return doNothing();
  }

  if (file.isStream()) {
    return emitError('Stream is not supported');
  }

  if (file.contents.slice(0, 3).toString() !== SEPARATOR) {
    return doNothing();
  }

  var rest = file.contents.slice(3).toString();
  var sepIndex = rest.indexOf(SEPARATOR);

  if (sepIndex < 0) {
    return doNothing();
  }

  try {
    file.meta = yaml.safeLoad(rest.slice(0, sepIndex));
  } catch (e) {
    return emitError(e);
  }

  file.contents = new Buffer(rest.slice(sepIndex + SEPARATOR.length));
  self.push(file);
  cb();
}

module.exports = function () {
  return through(transform);
}
