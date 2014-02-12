var path = require('path');
var through = require('through2').obj;
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var jade = require('jade');
var xtend = require('xtend');
var async = require('async');

var PLUGIN_NAME = 'blog';

function renderTemplateFunc(tmpl, dest, locals) {
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
      callback(null, file);
    });
  }
}

module.exports.index = function (config) {
  var files = [];
  var perPage = 3;

  function transform(file, enc, cb) {
    files.push(file);
    cb();
  }

  function flush(cb) {
    var self = this;

    var posts = files.map(function (file) {
      return xtend({ content: file.contents.toString() }, file.frontMatter);
    }).reverse();

    function localsForPage(page) {
      var locals = { site: config, posts: posts.slice(page * perPage, (page + 1) * perPage) };
      if (page === 1) {
        locals.prevPage = '/blog';
      } else if (page > 1) {
        locals.prevPage = '/blog/pages/' + page;
      }
      if (page < Math.ceil(posts.length / 3) - 1) {
        locals.nextPage = '/blog/pages/' + (page + 2);
      }
      return locals;
    }

    var funcs = [];
    var pageCount = Math.ceil(posts.length / perPage);

    funcs.push(renderTemplateFunc('index.jade', 'index.html', localsForPage(0)));
    for (var i = 1; i < pageCount; i++) {
      var dest = 'pages/' + (i + 1) + '/index.html';
      funcs.push(renderTemplateFunc('index.jade', dest,localsForPage(i)));
    }
    funcs.push(renderTemplateFunc('archives.jade', 'archives/index.html',
      { site: config, posts: posts }));

    async.parallel(funcs, function (err, files) {
      if (err) {
        self.emit('err', new PluginError(PLUGIN_NAME, err));
        return cb();
      }
      files.forEach(self.push.bind(self));
      cb();
    });
  }

  return through(transform, flush);
};

module.exports.layout = function (config) {
  function transform(file, enc, cb) {
    var self = this;

    if (!file.frontMatter || !file.frontMatter.layout) {
      this.push(file);
      return cb();
    }

    var templateFile = path.join(file.cwd, '/source/_layouts/', file.frontMatter.layout + '.jade');
    var locals = {
      site: config,
      post: xtend({ content: file.contents.toString() }, file.frontMatter)
    };

    jade.renderFile(templateFile, locals, function (err, data) {
      if (err) {
        self.emit('error', new PluginError(PLUGIN_NAME, err));
        return cb();
      }

      file.contents = new Buffer(data);
      self.push(file);
      cb();
    });
  }

  return through(transform);
};

module.exports.cleanUrl = function () {
  function transform(file, enc, cb) {
    if (!file.frontMatter) {
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
    file.frontMatter.url = ['/blog', date[0], date[1], date[2], dirname].join('/')

    this.push(file);
    cb();
  }

  return through(transform);
};
