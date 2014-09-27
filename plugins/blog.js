var fs = require('fs');
var path = require('path');
var util = require('util');
var through = require('through2').obj;
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var jade = require('jade');
var async = require('async');
var mkdirp = require('mkdirp');
var strftime = require('strftime');

var PLUGIN_NAME = 'blog';

function templateCache() {
  var compiledTemplates = {};

  return function(filePath, callback) {
    var compiled = compiledTemplates[filePath];
    if (compiled) return callback(null, compiled);

    fs.readFile(filePath, { encoding: 'utf8' }, function(err, data) {
      try {
        compiled = jade.compile(data, { filename: filePath });
      } catch(e) {
        return callback(e);
      }
      compiledTemplates[filePath] = compiled;
      callback(null, compiled);
    });
  };
}

function toURL(str) {
  return str.toLowerCase().replace(/[^a-z\-]/g, ' ').replace(/\s+/g, '-');
}

module.exports.index = function(config) {
  var files = [];
  var perPage = config.perPage || 3;
  var getCompiledTemplate = templateCache();

  // Return a function that renders `tmpl` with `locals` data into `dest`.
  function renderTemplateFunc(tmpl, dest, locals) {
    var templateFile = path.join(process.cwd(), config.sourceDir, config.layoutDir, tmpl);
    return function(callback) {
      getCompiledTemplate(templateFile, function(err, compiled) {
        if (err) {
          callback(err);
          return;
        }

        var data;
        try {
          data = compiled(locals);
        } catch (e) {
          callback(e);
          return;
        }

        var file = new gutil.File({
          cwd: process.cwd(),
          base: path.join(__dirname, config.sourceDir),
          path: path.join(__dirname, config.sourceDir, dest),
          contents: new Buffer(data)
        });
        callback(null, file);
      });
    };
  }

  function localsForPage(page, posts) {
    var locals = {
      site: config,
      posts: posts.slice(page * perPage, (page + 1) * perPage)
    };
    if (page === 1) {
      locals.prevPage = '/';
    } else if (page > 1) {
      locals.prevPage = path.join('/', config.blogDir, 'pages', page.toString());
    }
    if (page < Math.ceil(posts.length / 3) - 1) {
      locals.nextPage = path.join('/', config.blogDir, 'pages', (page + 2).toString());
    }
    return locals;
  }

  function transform(file, enc, cb) {
    files.push(file);
    cb();
  }

  function flush(cb) {
    var self = this;

    var posts = files.map(function(file) {
      return util._extend({ content: file.contents.toString() }, file.frontMatter);
    }).reverse();

    var localsForArchive = { site: config, posts: posts };

    // Render index pages and archive page in parallel.
    var funcs = [];
    var pageCount = Math.ceil(posts.length / perPage);

    // Top page.
    funcs.push(renderTemplateFunc('index.jade', 'index.html', localsForPage(0, posts)));

    // Index pages.
    for (var i = 1; i < pageCount; i++) {
      var dest = path.join(config.blogDir, 'pages', (i + 1).toString(), 'index.html');
      funcs.push(renderTemplateFunc('index.jade', dest, localsForPage(i, posts)));
    }

    // Archive page.
    funcs.push(renderTemplateFunc('archives.jade', path.join(config.blogDir, 'archives', 'index.html'), localsForArchive));

    async.parallel(funcs, function(err, files) {
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

module.exports.layout = function(config) {
  var getCompiledTemplate = templateCache();

  function transform(file, enc, cb) {
    var self = this;

    if (!file.frontMatter || !file.frontMatter.layout) {
      self.push(file);
      return cb();
    }

    var templatePath = path.join(file.cwd, config.sourceDir, config.layoutDir, file.frontMatter.layout + '.jade');

    getCompiledTemplate(templatePath, function(err, compiled) {
      if (err) {
        self.emit('error', new PluginError(PLUGIN_NAME, err));
        return cb();
      }

      var locals = {
        site: config,
        post: util._extend({ content: file.contents.toString() }, file.frontMatter)
      };

      try {
        file.contents = new Buffer(compiled(locals));
      } catch(e) {
        self.emit('error', new PluginError(PLUGIN_NAME, e));
        return cb();
      }

      self.push(file);
      cb();
    });
  }

  return through(transform);
};

module.exports.cleanUrl = function() {
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
    file.frontMatter.url = path.join('/blog', date[0], date[1], date[2], dirname)

    this.push(file);
    cb();
  }

  return through(transform);
};

module.exports.newPost = function(title, config) {
  var urlTitle = toURL(title);
  var now = new Date();
  var date = strftime('%Y-%m-%d', now);
  var filename = path.join(config.sourceDir, config.postDir, util.format('%s-%s.markdown', date, urlTitle));

  gutil.log(util.format('Creating new post: %s', filename));

  var writer = fs.createWriteStream(filename);
  writer.write("---\n");
  writer.write("layout: post\n");
  writer.write(util.format("title: \"%s\"\n", title));
  writer.write(util.format("date: %s\n", strftime('%Y-%m-%d %H:%M')));
  writer.write("comments: true\n");
  writer.write("categories: \n");
  writer.write("---\n");
  writer.end();
};

module.exports.newPage = function(filename, config) {
  var filenamePattern = /(^.+\/)?(.+)/;
  var matches = filenamePattern.exec(filename);
  if (!matches) {
    throw new PluginError(PLUGIN_NAME, ['Syntac error:', filename, 'contains unsupported characters'].join(' '));
  }

  var dirComponents = [config.sourceDir];
  dirComponents = dirComponents.concat((matches[1] || '').split('/').filter(Boolean));

  var components = matches[2].split('.');
  var extension;
  if (components.length > 1) {
    extension = components.pop();
  }
  var title = components.join('.');
  var file= toURL(title);

  if (!extension) {
    dirComponents.push(file);
    file = 'index';
  }
  extension = extension || config.newPageExtension;

  var pageDir = dirComponents.map(toURL).join('/');

  var filePath = util.format('%s/%s.%s', pageDir, file, extension);

  gutil.log(util.format('Creating new page: %s', filePath));

  mkdirp.sync(pageDir);

  var writer = fs.createWriteStream(filePath);
  writer.write("---\n");
  writer.write("layout: page\n");
  writer.write(util.format("title: \"%s\"\n", title));
  writer.write(util.format("date: %s\n", strftime('%Y-%m-%d %H:%M')));
  writer.write("comments: true\n");
  writer.write("---\n");
  writer.end();
};
