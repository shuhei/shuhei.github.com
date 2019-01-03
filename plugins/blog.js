const fs = require("fs");
const path = require("path");
const util = require("util");
const { obj: through } = require("through2");
const gutil = require("gulp-util");
const jade = require("jade");
const async = require("async");
const mkdirp = require("mkdirp");
const strftime = require("strftime");

const Layout = require("../source/_layouts/Layout");
const IndexPage = require("../source/_layouts/IndexPage");
const ArchivesPage = require("../source/_layouts/ArchivesPage");
const PostPage = require("../source/_layouts/PostPage");
const PagePage = require("../source/_layouts/PagePage");

const { PluginError } = gutil;

const PLUGIN_NAME = "blog";

function renderPage(component, props, css) {
  const { title, body } = component(props);
  return Layout({
    ...props,
    css,
    title,
    children: body
  });
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

    fs.readFile(filePath, { encoding: "utf8" }, (err, data) => {
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

  // Return a function that renders `tmpl` with `locals` data into `dest`.
  function renderTemplateFunc(tmpl, dest, locals) {
    const templateFile = path.join(
      process.cwd(),
      config.sourceDir,
      config.layoutDir,
      tmpl
    );
    return callback => {
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
          contents: Buffer.from(data)
        });
        callback(null, file);
      });
    };
  }

  function renderPageFunc(component, dest, locals) {
    return callback => {
      try {
        const data = renderPage(component, locals, config.css);
        const file = new gutil.File({
          cwd: process.cwd(),
          base: path.join(__dirname, config.sourceDir),
          path: path.join(__dirname, config.sourceDir, dest),
          contents: Buffer.from(data)
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
    const funcs = [];
    const pageCount = Math.ceil(posts.length / perPage);

    // Top page.
    funcs.push(
      renderPageFunc(IndexPage, "index.html", localsForPage(0, posts))
    );

    // Index pages.
    for (let i = 1; i < pageCount; i += 1) {
      const dest = path.join(
        config.blogDir,
        "pages",
        (i + 1).toString(),
        "index.html"
      );
      const pageLocals = localsForPage(i, posts);
      funcs.push(renderPageFunc(IndexPage, dest, pageLocals));
    }

    // Archive page.
    const archivePath = path.join(config.blogDir, "archives", "index.html");
    const localsForArchive = {
      site: config,
      posts: posts.map(post => ({ ...post, content: undefined }))
    };
    funcs.push(renderPageFunc(ArchivesPage, archivePath, localsForArchive));

    // RSS feed.
    const rssPath = path.join(config.blogDir, "feed", "rss.xml");
    const localsForRss = {
      site: config,
      posts: posts.slice(0, 10)
    };
    funcs.push(renderTemplateFunc("rss.jade", rssPath, localsForRss));

    // Execute in parallel. Rendering is synchronous thougth.
    async.parallel(funcs, (err, newFiles) => {
      if (err) {
        console.error("error", err);
        this.emit("err", new PluginError(PLUGIN_NAME, err));
        cb();
        return;
      }
      newFiles.forEach(file => this.push(file));
      cb();
    });
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
        renderPage(component, locals, config.css)
      );
      this.push(htmlFile);
    } catch (e) {
      this.emit("error", new PluginError(PLUGIN_NAME, e));
    }

    cb();
  }

  return through(transform);
}

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

function newPost(title, config) {
  const urlTitle = toURL(title);
  const now = new Date();
  const date = strftime("%Y-%m-%d", now);
  const filename = util.format("%s-%s.markdown", date, urlTitle);
  const newPostPath = path.join(config.sourceDir, config.postDir, filename);

  gutil.log(`Creating new post: ${newPostPath}`);

  const writer = fs.createWriteStream(newPostPath);
  writer.write("---\n");
  writer.write("layout: post\n");
  writer.write(util.format('title: "%s"\n', title));
  writer.write(util.format("date: %s\n", strftime("%Y-%m-%d %H:%M")));
  writer.write("comments: true\n");
  writer.write("categories: []\n");
  writer.write("---\n");
  writer.end();
  return writer;
}

function newPage(filename, config) {
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

  const filePath = util.format("%s/%s.%s", pageDir, file, extension);

  gutil.log(util.format("Creating new page: %s", filePath));

  mkdirp.sync(pageDir);

  const writer = fs.createWriteStream(filePath);
  writer.write("---\n");
  writer.write("layout: page\n");
  writer.write(util.format('title: "%s"\n', title));
  writer.write(util.format("date: %s\n", strftime("%Y-%m-%d %H:%M")));
  writer.write("comments: true\n");
  writer.write("---\n");
  writer.end();
  return writer;
}

module.exports = {
  index,
  layout,
  cleanUrl,
  newPost,
  newPage
};
