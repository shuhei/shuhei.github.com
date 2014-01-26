var path = require('path');
var through = require('through2').obj;
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var jade = require('jade');
var xtend = require('xtend');
var async = require('async');

var PLUGIN_NAME = 'blog';

module.exports.index = function (config) {
  var files = [];

  return through(function (file, enc, cb) {
    files.push(file);
    cb();
  }, function (cb) {
    var self = this;

    var posts = files.map(function (file) {
      return xtend({ content: file.contents.toString() }, file.meta);
    }).reverse();

    var locals = { site: config, posts: posts };

    function renderTemplateFunc(tmpl, dest) {
      var templateFile = path.join(process.cwd(),'source/_layouts', tmpl);
      return function (callback) {
        jade.renderFile(templateFile, locals, function (err, data) {
          if (err) return callback(err);

          var file = new gutil.File({
            cwd: process.cwd(),
            base: path.join(__dirname, 'source/blog'),
            path: path.join(__dirname, 'source/blog', dest),
            contents: new Buffer(data)
          });
          self.push(file);
          callback(null, file);
        });
      }
    }

    async.parallel([
      renderTemplateFunc('index.jade', 'index.html'),
      renderTemplateFunc('archives.jade', 'archives/index.html')
    ], function (err) {
      if (err) {
        self.emit('err', new PluginError(PLUGIN_NAME, err));
        return;
      }
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

    var templateFile = path.join(file.cwd, '/source/_layouts/', file.meta.layout + '.jade');
    var locals = {
      site: config,
      post: xtend({ content: file.contents.toString() }, file.meta)
    };

    jade.renderFile(templateFile, locals, function (err, data) {
      if (err) {
        self.emit('error', new PluginError(PLUGIN_NAME, err));
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
    var dirname = nameComponents.slice(3).join('-').replace(/\.html$/, '');

    components.splice(components.length - 1, 1, date[0], date[1], date[2], dirname, 'index.html');

    file.path = components.join(path.sep);
    file.meta.url = ['/blog', date[0], date[1], date[2], dirname].join('/')

    this.push(file);
    cb();
  });
};
