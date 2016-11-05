import fs from 'fs';
import path from 'path';
import util from 'util';
import { obj as through } from 'through2';
import gutil, { PluginError } from 'gulp-util';
import jade from 'jade';
import async from 'async';
import mkdirp from 'mkdirp';
import strftime from 'strftime';
import React from 'react';
import { renderToString } from 'react-dom/server';
import Helmet from 'react-helmet';

import IndexPage from '../source/_layouts/IndexPage';
import ArchivesPage from '../source/_layouts/ArchivesPage';
import PostPage from '../source/_layouts/PostPage';
import PagePage from '../source/_layouts/PagePage';

const PLUGIN_NAME = 'blog';

// Returns a function that compiles jade template using caches.
function templateCache() {
  const compiledTemplates = {};

  return (filePath, callback) => {
    let compiled = compiledTemplates[filePath];
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
  return str.toLowerCase().replace(/'/g, '').replace(/[^a-z1-9\-]/g, ' ').replace(/\s+/g, '-');
}

export function index(config) {
  const files = [];
  const perPage = config.perPage || 3;
  const getCompiledTemplate = templateCache();

  // Return a function that renders `tmpl` with `locals` data into `dest`.
  function renderTemplateFunc(tmpl, dest, locals) {
    const templateFile = path.join(process.cwd(), config.sourceDir, config.layoutDir, tmpl);
    return (callback) => {
      getCompiledTemplate(templateFile, function(err, compiled) {
        if (err) {
          callback(err);
          return;
        }

        let data;
        try {
          data = compiled(locals);
        } catch (e) {
          callback(e);
          return;
        }

        const file = new gutil.File({
          cwd: process.cwd(),
          base: path.join(__dirname, config.sourceDir),
          path: path.join(__dirname, config.sourceDir, dest),
          contents: new Buffer(data)
        });
        callback(null, file);
      });
    };
  }

  function renderReactFunc(component, dest, locals) {
    return (callback) => {
      try {
        const data = renderPage(component, locals);
        const file = new gutil.File({
          cwd: process.cwd(),
          base: path.join(__dirname, config.sourceDir),
          path: path.join(__dirname, config.sourceDir, dest),
          contents: new Buffer(data),
        });
        callback(null, file);
      } catch (e) {
        callback(e);
      }
    };
  }

  function localsForPage(page, posts) {
    const locals = {
      site: config,
      posts: posts.slice(page * perPage, (page + 1) * perPage)
    };
    if (page === 1) {
      locals.prevPage = '/';
      locals.title = `Page ${page + 1}`;
    } else if (page > 1) {
      locals.prevPage = path.join('/', config.blogDir, 'pages', page.toString());
      locals.title = `Page ${page + 1}`;
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
    const posts = files.map((file) => {
      return util._extend({ content: file.contents.toString() }, file.frontMatter);
    }).reverse();

    // Render index pages and archive page in parallel.
    const funcs = [];
    const pageCount = Math.ceil(posts.length / perPage);

    // Top page.
    funcs.push(renderReactFunc(IndexPage, 'index.html', localsForPage(0, posts)));

    // Index pages.
    for (let i = 1; i < pageCount; i++) {
      const dest = path.join(config.blogDir, 'pages', (i + 1).toString(), 'index.html');
      funcs.push(renderReactFunc(IndexPage, dest, localsForPage(i, posts)));
    }

    // Archive page.
    const archivePath = path.join(config.blogDir, 'archives', 'index.html');
    const localsForArchive = {
      site: config,
      posts: posts,
    };
    funcs.push(renderReactFunc(ArchivesPage, archivePath, localsForArchive));

    // RSS feed.
    const rssPath = path.join(config.blogDir, 'feed', 'rss.xml');
    const localsForRss = {
      site: config,
      posts: posts.slice(0, 10)
    };
    funcs.push(renderTemplateFunc('rss.jade', rssPath, localsForRss));

    // Execute in parallel. React's rendering is synchronous thougth.
    async.parallel(funcs, (err, files) => {
      if (err) {
        console.log('error', err);
        this.emit('err', new PluginError(PLUGIN_NAME, err));
        return cb();
      }
      files.forEach((file) => this.push(file));
      cb();
    });
  }

  return through(transform, flush);
};

function renderPage(component, props) {
  const contentHtml = renderToString(
    React.createElement(component, props)
  );
  const head = Helmet.rewind();

  // https://github.com/nfl/react-helmet#as-string-output
  return `
    <!doctype html>
    <html ${head.htmlAttributes.toString()}>
      <head>
        ${head.meta.toString()}
        ${head.title.toString()}
        ${head.link.toString()}
      </head>
      <body>
        <div>${contentHtml}</div>
      </body>
    </html>
  `.trim();
}

export function layout(config) {
  const getCompiledTemplate = templateCache();

  function transform(file, enc, cb) {
    if (!file.frontMatter || !file.frontMatter.layout) {
      this.push(file);
      return cb();
    }

    const { layout } = file.frontMatter;
    if (layout !== 'post' && layout !== 'page') {
      this.emit('error', new PluginError(PLUGIN_NAME, `Unknown layout: ${layout} at ${file.path}`));
      return cb();
    }

    const component = layout === 'post' ? PostPage : PagePage;
    const locals = {
      site: config,
      post: {
        ...file.frontMatter,
        content: file.contents.toString(),
      },
    };

    try {
      file.contents = new Buffer(renderPage(component, locals));
    } catch (e) {
      this.emit('error', new PluginError(PLUGIN_NAME, e));
      return cb();
    }

    this.push(file);
    cb();
  }

  return through(transform);
};

export function cleanUrl() {
  function transform(file, enc, cb) {
    if (!file.frontMatter) {
      this.push(file);
      return cb();
    }

    const components = file.path.split(path.sep);
    const basename = components[components.length - 1];

    const nameComponents = basename.split('-');
    const date = nameComponents.slice(0, 3);
    const dirname = nameComponents.slice(3).join('-').replace(/\.html$/, '');

    components.splice(components.length - 1, 1, date[0], date[1], date[2], dirname, 'index.html');

    file.path = components.join(path.sep);
    file.frontMatter.url = path.join('/blog', date[0], date[1], date[2], dirname)

    this.push(file);
    cb();
  }

  return through(transform);
};

export function newPost(title, config) {
  const urlTitle = toURL(title);
  const now = new Date();
  const date = strftime('%Y-%m-%d', now);
  const filename = util.format('%s-%s.markdown', date, urlTitle);
  const newPostPath = path.join(config.sourceDir, config.postDir, filename);

  gutil.log(`Creating new post: ${newPostPath}`);

  const writer = fs.createWriteStream(newPostPath);
  writer.write("---\n");
  writer.write("layout: post\n");
  writer.write(util.format("title: \"%s\"\n", title));
  writer.write(util.format("date: %s\n", strftime('%Y-%m-%d %H:%M')));
  writer.write("comments: true\n");
  writer.write("categories: \n");
  writer.write("---\n");
  writer.end();
};

export function newPage(filename, config) {
  const filenamePattern = /(^.+\/)?(.+)/;
  const matches = filenamePattern.exec(filename);
  if (!matches) {
    throw new PluginError(PLUGIN_NAME, `Syntax error: ${filename} contains unsupported characters`);
  }

  const dirComponents = [config.sourceDir].concat((matches[1] || '').split('/').filter(Boolean));

  const components = matches[2].split('.');
  let extension;
  if (components.length > 1) {
    extension = components.pop();
  }
  const title = components.join('.');
  let file = toURL(title);

  if (!extension) {
    dirComponents.push(file);
    file = 'index';
  }
  extension = extension || config.newPageExtension;

  const pageDir = dirComponents.map(toURL).join('/');

  const filePath = util.format('%s/%s.%s', pageDir, file, extension);

  gutil.log(util.format('Creating new page: %s', filePath));

  mkdirp.sync(pageDir);

  const writer = fs.createWriteStream(filePath);
  writer.write("---\n");
  writer.write("layout: page\n");
  writer.write(util.format("title: \"%s\"\n", title));
  writer.write(util.format("date: %s\n", strftime('%Y-%m-%d %H:%M')));
  writer.write("comments: true\n");
  writer.write("---\n");
  writer.end();
};
