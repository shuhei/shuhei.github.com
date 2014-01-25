var path = require('path');
var through = require('through2').obj;
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var jade = require('jade');
var xtend = require('xtend');

var PLUGIN_NAME = 'blog';

module.exports.index = function (config) {
  var files = [];
  return through(function (file, enc, cb) {
    files.push(file);
    cb();
  }, function (cb) {
    var self = this;

    var locals = {
      site: config,
      posts: files.map(function (file) { return file.meta; }).reverse()
    }

    var templateFile = path.join(__dirname, 'source/_layouts/index.jade');
    jade.renderFile(templateFile, locals, function (err, data) {
      if (err) {
        self.emit('err', new PluginError(PLUGIN_NAME, err));
        return;
      }

      var file = new gutil.File({
        cwd: process.cwd(),
        base: path.join(__dirname, 'source/blog'),
        path: path.join(__dirname, 'source/blog/index.html'),
        contents: new Buffer(data)
      });
      self.push(file);
      cb();
    });
  });
};

module.exports.archive = function () {
};

module.exports.layout = function (config) {
  return through(function (file, enc, cb) {
    var self = this;

    if (!file.meta || !file.meta.layout) {
      this.push(file);
      return cb();
    }

    var templateFile = path.join(__dirname, '/source/_layouts/', file.meta.layout + '.jade');
    var locals = {
      site: config,
      post: xtend({ content: file.contents.toString() }, file.meta)
    };

    jade.renderFile(templateFile, locals, function (err, data) {
      if (err) {
        self.emit('err', new PluginError(PLUGIN_NAME, err));
        return;
      }

      file.contents = new Buffer(data);
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

    components.splice(components.length - 1, 1, date[0], date[1], date[2], newName);

    file.path = components.join(path.sep);
    file.meta.url = ['/blog', date[0], date[1], date[2], newName].join('/')

    this.push(file);
    cb();
  });
};
