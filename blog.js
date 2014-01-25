var fs = require('fs');
var path = require('path');
var through = require('through2').obj;
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var jade = require('jade');

var PLUGIN_NAME = 'blog';

module.exports.index = function () {
};

module.exports.archive = function () {
};

module.exports.layout = function () {
  return through(function (file, enc, cb) {
    var self = this;

    if (!file.meta || !file.meta.layout) {
      this.push(file);
      return cb();
    }

    var templateFile = './source/_layouts/' + file.meta.layout + '.jade';
    fs.readFile(templateFile, { encoding: 'utf8' }, function (err, tmplData) {
      if (err) {
        self.emit('err', new PluginError(PLUGIN_NAME, err));
        return;
      }

      var template = jade.compile(tmplData);
      var locals = {
        site: {
          title: 'Hello, World!'
        },
        post: {
          title: file.meta.title,
          content: file.contents.toString()
        }
      };
      file.contents = new Buffer(template(locals));
      self.push(file);
      cb();
    });
  });
};

module.exports.cleanUrl = function () {
  return through(function (file, enc, cb) {
    if (!file.meta) {
      this.push(file);
      return cb();
    }

    var components = file.path.split(path.sep);
    var basename = components[components.length - 1];

    var nameComponents = basename.split('-');
    var date = nameComponents.slice(0, 3);
    var newName = nameComponents.slice(3).join('-');

    components.splice(components.length - 1, 0, date[0], date[1], date[2]);

    file.path = components.join(path.sep);

    this.push(file);
    cb();
  });
};
