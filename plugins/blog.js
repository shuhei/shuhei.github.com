const fs = require("fs");
const path = require("path");
const util = require("util");
const { obj: through } = require("through2");
const gutil = require("gulp-util");
const pug = require("pug");
const mkdirp = require("mkdirp");
const strftime = require("strftime");

const Layout = require("../source/_layouts/Layout");
const IndexPage = require("../source/_layouts/IndexPage");
const ArchivesPage = require("../source/_layouts/ArchivesPage");
const PostPage = require("../source/_layouts/PostPage");
const PagePage = require("../source/_layouts/PagePage");

const { PluginError } = gutil;
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

const PLUGIN_NAME = "blog";

function renderPageContent(component, props, css) {
  const { title, body, image, description } = component(props);
  return Layout({
    ...props,
    css,
    title,
    image,
    description,
    children: body
  });
}

// Returns a function that compiles pug template using caches.
function templateCache() {
  const compiledTemplates = {};

  return async filePath => {
    let compiled = compiledTemplates[filePath];
    if (compiled) {
      return compiled;
    }

    const data = await readFile(filePath, { encoding: "utf8" });
    compiled = pug.compile(data, { filename: filePath });
    compiledTemplates[filePath] = compiled;
    return compiled;
  };
}

function toURL(str) {
  return str
    .toLowerCase()
    .replace(/'/g, "")
    .replace(/[^a-z0-9-]/g, " ")
    .replace(/\s+/g, "-");
}

function index(config) {
  const files = [];
  const perPage = config.perPage || 3;
  const getCompiledTemplate = templateCache();

  // Render `tmpl` with `locals` data into `dest`.
  async function renderTemplate(tmpl, dest, locals) {
    const templateFile = path.join(
      process.cwd(),
      config.sourceDir,
      config.layoutDir,
      tmpl
    );
    const compiled = await getCompiledTemplate(templateFile);
    const data = compiled(locals);

    return new gutil.File({
      cwd: process.cwd(),
      base: path.join(__dirname, config.sourceDir),
      path: path.join(__dirname, config.sourceDir, dest),
      contents: Buffer.from(data)
    });
  }

  async function renderPage(component, dest, locals) {
    const data = renderPageContent(component, locals, config.css);

    return new gutil.File({
      cwd: process.cwd(),
      base: path.join(__dirname, config.sourceDir),
      path: path.join(__dirname, config.sourceDir, dest),
      contents: Buffer.from(data)
    });
  }

  function localsForPage(page, posts) {
    const locals = {
      site: config,
      posts: posts.slice(page * perPage, (page + 1) * perPage)
    };
    if (page === 0) {
      locals.title = config.title;
    } else if (page === 1) {
      locals.prevPage = "/";
      locals.title = `Page ${page + 1} - ${config.title}`;
    } else if (page > 1) {
      locals.prevPage = path.join(
        "/",
        config.blogDir,
        "pages",
        page.toString(),
        "/"
      );
      locals.title = `Page ${page + 1} - ${config.title}`;
    }
    if (page < Math.ceil(posts.length / 3) - 1) {
      locals.nextPage = path.join(
        "/",
        config.blogDir,
        "pages",
        (page + 2).toString(),
        "/"
      );
    }
    return locals;
  }

  function transform(file, enc, cb) {
    files.push(file);
    cb();
  }

  function flush(cb) {
    const posts = files
      .filter(file => (file.frontMatter && file.frontMatter.status) !== "draft")
      .map(file => ({
        ...file.frontMatter,
        content: file.contents.toString()
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .reverse();

    // Render index pages and archive page in parallel.
    const promises = [];
    const pageCount = Math.ceil(posts.length / perPage);

    // Top page.
    promises.push(renderPage(IndexPage, "index.html", localsForPage(0, posts)));

    // Index pages.
    for (let i = 1; i < pageCount; i += 1) {
      const dest = path.join(
        config.blogDir,
        "pages",
        (i + 1).toString(),
        "index.html"
      );
      const pageLocals = localsForPage(i, posts);
      promises.push(renderPage(IndexPage, dest, pageLocals));
    }

    // Archive page.
    const archivePath = path.join(config.blogDir, "archives", "index.html");
    const localsForArchive = {
      site: config,
      posts: posts.map(post => ({ ...post, content: undefined }))
    };
    promises.push(renderPage(ArchivesPage, archivePath, localsForArchive));

    // RSS feed.
    const rssPath = path.join(config.blogDir, "feed", "rss.xml");
    const localsForRss = {
      site: config,
      posts: posts.slice(0, 10)
    };
    promises.push(renderTemplate("rss.pug", rssPath, localsForRss));

    // Execute in parallel. Rendering is synchronous thougth.
    Promise.all(promises).then(
      newFiles => {
        newFiles.forEach(file => this.push(file));
        cb();
      },
      err => {
        console.error("error", err);
        this.emit("err", new PluginError(PLUGIN_NAME, err));
        cb();
      }
    );
  }

  return through(transform, flush);
}

function layout(config) {
  function transform(file, enc, cb) {
    if (!file.frontMatter || !file.frontMatter.layout) {
      this.push(file);
      cb();
      return;
    }

    const { layout: layoutName } = file.frontMatter;
    if (layoutName !== "post" && layoutName !== "page") {
      this.emit(
        "error",
        new PluginError(
          PLUGIN_NAME,
          `Unknown layout: ${layoutName} at ${file.path}`
        )
      );
      cb();
      return;
    }

    const component = layoutName === "post" ? PostPage : PagePage;
    const locals = {
      site: config,
      post: {
        ...file.frontMatter,
        content: file.contents.toString()
      }
    };

    try {
      const htmlFile = file.clone(false);
      htmlFile.contents = Buffer.from(
        renderPageContent(component, locals, config.css)
      );
      this.push(htmlFile);
    } catch (e) {
      this.emit("error", new PluginError(PLUGIN_NAME, e));
    }

    cb();
  }

  return through(transform);
}

// Create a transform stream that adds a clean URL and a path to a file with a
// front matter. It passes through files without front matters.
function cleanUrl() {
  function transform(file, enc, cb) {
    if (!file.frontMatter) {
      this.push(file);
      cb();
      return;
    }

    const components = file.path.split(path.sep);
    const basename = components[components.length - 1];

    const nameComponents = basename.split("-");
    const date = nameComponents.slice(0, 3);
    const dirname = nameComponents
      .slice(3)
      .join("-")
      .replace(/\.html$/, "");

    components.splice(
      components.length - 1,
      1,
      date[0],
      date[1],
      date[2],
      dirname,
      "index.html"
    );

    const newFile = file.clone(false);
    newFile.path = components.join(path.sep);
    newFile.frontMatter.url = path.join(
      "/blog",
      date[0],
      date[1],
      date[2],
      dirname,
      "/"
    );

    this.push(newFile);
    cb();
  }

  return through(transform);
}

async function newPost(title, config) {
  const filename = `${strftime("%Y-%m-%d")}-${toURL(title)}.markdown`;
  const newPostPath = path.join(config.sourceDir, config.postDir, filename);

  gutil.log(`Creating new post: ${newPostPath}`);

  const content = `---
layout: post
title: ${title}
date: ${strftime("%Y-%m-%d %H:%M")}
comments: true
categories: []
---
`;

  await writeFile(newPostPath, content);
}

async function newPage(filename, config) {
  const filenamePattern = /(^.+\/)?(.+)/;
  const matches = filenamePattern.exec(filename);
  if (!matches) {
    throw new PluginError(
      PLUGIN_NAME,
      `Syntax error: ${filename} contains unsupported characters`
    );
  }

  const dirComponents = [config.sourceDir].concat(
    (matches[1] || "").split("/").filter(Boolean)
  );

  const components = matches[2].split(".");
  let extension;
  if (components.length > 1) {
    extension = components.pop();
  }
  const title = components.join(".");
  let file = toURL(title);

  if (!extension) {
    dirComponents.push(file);
    file = "index";
  }
  extension = extension || config.newPageExtension;

  const pageDir = dirComponents.map(toURL).join("/");

  const filePath = `${pageDir}/${file}.${extension}`;

  gutil.log(`Creating new page: ${filePath}`);

  mkdirp.sync(pageDir);

  const content = `---
layout: page
title: ${title}
date: ${strftime("%Y-%m-%d %H:%M")}
comments: true
---
`;

  await writeFile(filePath, content);
}

module.exports = {
  index,
  layout,
  cleanUrl,
  newPost,
  newPage
};
