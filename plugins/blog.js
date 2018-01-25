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
import CleanCSS from 'clean-css';

import Layout from '../source/_layouts/Layout';
import IndexPage from '../source/_layouts/IndexPage';
import ArchivesPage from '../source/_layouts/ArchivesPage';
import PostPage from '../source/_layouts/PostPage';
import PagePage from '../source/_layouts/PagePage';

const PLUGIN_NAME = 'blog';

// Escape characters that are valid in JSON but not in JavaScript.
// https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#Issue_with_plain_JSON.stringify_for_use_as_JavaScript
function jsFriendlyJSONStringify(source) {
  return JSON.stringify(source)
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

function renderPage(component, props, css) {
  const contentHtml = renderToString(
    React.createElement(
      Layout,
      props,
      React.createElement(component, props),
    )
  );
  const head = Helmet.rewind();

  const fontCSS = '//fonts.googleapis.com/css?family=Asap:400,700';
  const jsURL = '/js/index.js';

  // https://github.com/nfl/react-helmet#as-string-output
  //
  // <!-- --> is necessary to put </script> in the JSON.
  //
  // It's important to have a <script> tag in head. Otherwise Google Analytics
  // inserts <script> tag after inline <script> in blog content and makes React
  // upset.
  return `
    <!doctype html>
    <html ${head.htmlAttributes.toString()}>
      <head>
        <meta charset="utf-8">
        <link rel="preload" href="${fontCSS}" as="style">
        <link rel="preload" href="${jsURL}" as="script">
        <link rel="preconnect" href="//fonts.gstatic.com" crossorigin>
        <meta name="viewport" content="initial-scale=1">
        ${head.title.toString()}
        <link rel="icons" sizes="16x16 32x32 48x48" href="/favicon.ico">
        <link rel="alternate" type="application/rss+xml" title="RSS Feed for shuheikagawa.com" href="/blog/feed/rss.xml">
        <link rel="stylesheet" href="${fontCSS}">
        <script>
          (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
          (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
          m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
          })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

          ga('create', 'UA-309586-8', 'shuheikagawa.com');
          ga('send', 'pageview');
        </script>
        <style>${css}</style>
      </head>
      <body>
        <div id="container">${contentHtml}</div>
        <script><!--
          window.__PRELOADED_PROPS__ = ${jsFriendlyJSONStringify(props)};
        --></script>
        <script src="${jsURL}" defer></script>
      </body>
    </html>
  `.trim();
}

// Returns a function that compiles jade template using caches.
function templateCache() {
  const compiledTemplates = {};

  return (filePath, callback) => {
    let compiled = compiledTemplates[filePath];
    if (compiled) {
      callback(null, compiled);
      return;
    }

    fs.readFile(filePath, { encoding: 'utf8' }, (err, data) => {
      try {
        compiled = jade.compile(data, { filename: filePath });
      } catch (e) {
        callback(e);
        return;
      }
      compiledTemplates[filePath] = compiled;
      callback(null, compiled);
    });
  };
}

function toURL(str) {
  return str.toLowerCase().replace(/'/g, '').replace(/[^a-z1-9-]/g, ' ').replace(/\s+/g, '-');
}

function readCssFiles(filePaths) {
  const concatenated = filePaths
    .map(css => fs.readFileSync(css, { encoding: 'utf8' }))
    .join('\n');
  return new CleanCSS({}).minify(concatenated).styles;
}

export function index(config) {
  const files = [];
  const perPage = config.perPage || 3;
  const getCompiledTemplate = templateCache();
  const css = readCssFiles(config.cssFiles);

  // Return a function that renders `tmpl` with `locals` data into `dest`.
  function renderTemplateFunc(tmpl, dest, locals) {
    const templateFile = path.join(process.cwd(), config.sourceDir, config.layoutDir, tmpl);
    return (callback) => {
      getCompiledTemplate(templateFile, (err, compiled) => {
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
          contents: new Buffer(data),
        });
        callback(null, file);
      });
    };
  }

  function renderReactFunc(component, dest, locals) {
    return (callback) => {
      try {
        const data = renderPage(component, locals, css);
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

  function renderJsonFunc(dest, data) {
    return (callback) => {
      const jsonDest = dest.replace(/\.html$/, '.json');
      const file = new gutil.File({
        cwd: process.cwd(),
        base: path.join(__dirname, config.sourceDir),
        path: path.join(__dirname, config.sourceDir, jsonDest),
        contents: new Buffer(JSON.stringify(data)),
      });
      callback(null, file);
    };
  }

  function localsForPage(page, posts) {
    const locals = {
      site: config,
      posts: posts.slice(page * perPage, (page + 1) * perPage),
    };
    if (page === 0) {
      locals.title = config.title;
    } else if (page === 1) {
      locals.prevPage = '/';
      locals.title = `Page ${page + 1} - ${config.title}`;
    } else if (page > 1) {
      locals.prevPage = path.join('/', config.blogDir, 'pages', page.toString(), '/');
      locals.title = `Page ${page + 1} - ${config.title}`;
    }
    if (page < Math.ceil(posts.length / 3) - 1) {
      locals.nextPage = path.join('/', config.blogDir, 'pages', (page + 2).toString(), '/');
    }
    return locals;
  }

  function transform(file, enc, cb) {
    files.push(file);
    cb();
  }

  function flush(cb) {
    const posts = files.map(file => ({
      ...file.frontMatter,
      content: file.contents.toString(),
    })).sort((a, b) => a.date.localeCompare(b.date)).reverse();

    // Render index pages and archive page in parallel.
    const funcs = [];
    const pageCount = Math.ceil(posts.length / perPage);

    // Top page.
    const topLocals = localsForPage(0, posts);
    funcs.push(renderReactFunc(IndexPage, 'index.html', localsForPage(0, posts)));
    funcs.push(renderJsonFunc('index.html', topLocals));

    // Index pages.
    for (let i = 1; i < pageCount; i += 1) {
      const dest = path.join(config.blogDir, 'pages', (i + 1).toString(), 'index.html');
      const pageLocals = localsForPage(i, posts);
      funcs.push(renderReactFunc(IndexPage, dest, pageLocals));
      funcs.push(renderJsonFunc(dest, pageLocals));
    }

    // Archive page.
    const archivePath = path.join(config.blogDir, 'archives', 'index.html');
    const localsForArchive = {
      site: config,
      posts: posts.map(post => ({ ...post, content: undefined })),
    };
    funcs.push(renderReactFunc(ArchivesPage, archivePath, localsForArchive));
    funcs.push(renderJsonFunc(archivePath, localsForArchive));

    // RSS feed.
    const rssPath = path.join(config.blogDir, 'feed', 'rss.xml');
    const localsForRss = {
      site: config,
      posts: posts.slice(0, 10),
    };
    funcs.push(renderTemplateFunc('rss.jade', rssPath, localsForRss));

    // Execute in parallel. React's rendering is synchronous thougth.
    async.parallel(funcs, (err, newFiles) => {
      if (err) {
        console.error('error', err);
        this.emit('err', new PluginError(PLUGIN_NAME, err));
        cb();
        return;
      }
      newFiles.forEach(file => this.push(file));
      cb();
    });
  }

  return through(transform, flush);
}

export function layout(config) {
  const css = readCssFiles(config.cssFiles);

  function transform(file, enc, cb) {
    if (!file.frontMatter || !file.frontMatter.layout) {
      this.push(file);
      cb();
      return;
    }

    const { layout: layoutName } = file.frontMatter;
    if (layoutName !== 'post' && layoutName !== 'page') {
      this.emit('error', new PluginError(PLUGIN_NAME, `Unknown layout: ${layoutName} at ${file.path}`));
      cb();
      return;
    }

    const component = layoutName === 'post' ? PostPage : PagePage;
    const locals = {
      site: config,
      post: {
        ...file.frontMatter,
        content: file.contents.toString(),
      },
    };

    try {
      const htmlFile = file.clone(false);
      htmlFile.contents = new Buffer(renderPage(component, locals, css));
      this.push(htmlFile);

      const jsonFile = file.clone(false);
      jsonFile.path = jsonFile.path.replace(/\.html$/, '.json');
      jsonFile.contents = new Buffer(JSON.stringify(locals));
      this.push(jsonFile);
    } catch (e) {
      this.emit('error', new PluginError(PLUGIN_NAME, e));
    }

    cb();
  }

  return through(transform);
}

export function cleanUrl() {
  function transform(file, enc, cb) {
    if (!file.frontMatter) {
      this.push(file);
      cb();
      return;
    }

    const components = file.path.split(path.sep);
    const basename = components[components.length - 1];

    const nameComponents = basename.split('-');
    const date = nameComponents.slice(0, 3);
    const dirname = nameComponents.slice(3).join('-').replace(/\.html$/, '');

    components.splice(components.length - 1, 1, date[0], date[1], date[2], dirname, 'index.html');

    const newFile = file.clone(false);
    newFile.path = components.join(path.sep);
    newFile.frontMatter.url = path.join('/blog', date[0], date[1], date[2], dirname, '/');

    this.push(newFile);
    cb();
  }

  return through(transform);
}

export function newPost(title, config) {
  const urlTitle = toURL(title);
  const now = new Date();
  const date = strftime('%Y-%m-%d', now);
  const filename = util.format('%s-%s.markdown', date, urlTitle);
  const newPostPath = path.join(config.sourceDir, config.postDir, filename);

  gutil.log(`Creating new post: ${newPostPath}`);

  const writer = fs.createWriteStream(newPostPath);
  writer.write('---\n');
  writer.write('layout: post\n');
  writer.write(util.format('title: "%s"\n', title));
  writer.write(util.format('date: %s\n', strftime('%Y-%m-%d %H:%M')));
  writer.write('comments: true\n');
  writer.write('categories: \n');
  writer.write('---\n');
  writer.end();
}

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
  writer.write('---\n');
  writer.write('layout: page\n');
  writer.write(util.format('title: "%s"\n', title));
  writer.write(util.format('date: %s\n', strftime('%Y-%m-%d %H:%M')));
  writer.write('comments: true\n');
  writer.write('---\n');
  writer.end();
}
