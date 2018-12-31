const path = require("path");

const { argv: args } = require("yargs");
const del = require("del");
const highlightjs = require("highlight.js");
const { Renderer } = require("marked");

const gulp = require("gulp");
const gutil = require("gulp-util");
const plumber = require("gulp-plumber");
const markdown = require("gulp-markdown");
const frontMatter = require("gulp-front-matter");
const textile = require("gulp-textile");

const condition = require("./plugins/condition");
const server = require("./plugins/server");
const { index, layout, cleanUrl, newPost, newPage } = require("./plugins/blog");
const branch = require("./plugins/branch");
const readCssFiles = require("./plugins/css");

const siteConfig = require("./source/_config/site.json");

const publicDir = "public";

const renderer = new Renderer();
// - Add `hljs` class to code blocks  https://github.com/chjj/marked/pull/418
// - Show filename if provided
// `language` can be a language identifier for highlight.js or a filename with an extension.
renderer.code = (code, language) => {
  const extension = (language || "").split(".").pop();
  const isValidLang = !!(extension && highlightjs.getLanguage(extension));
  const highlighted = isValidLang
    ? highlightjs.highlight(extension, code).value
    : code;
  const filename =
    extension && extension !== language
      ? `<div><span class="code__filename">${language}</span></div>`
      : "";
  return `<pre><code class="hljs ${extension}">${filename}${highlighted}</code></pre>`;
};
// Responsive table
// https://www.w3schools.com/howto/howto_css_table_responsive.asp
renderer.table = (header, body) => {
  const table = Renderer.prototype.table.call(this, header, body);
  return `<div class="table-wrapper">${table}</div>`;
};

// HACK: Build CSS and keep it in a variable.
let css;
gulp.task("css", async () => {
  css = await readCssFiles(siteConfig.cssFiles);
});

// Copy static pages compiling markdown files.
gulp.task("copy", ["css"], () => {
  const config = {
    ...siteConfig,
    css
  };

  return (
    gulp
      .src(["source/**/*", "!source/_*", "!source/_*/**/*", "source/.nojekyll"])
      .pipe(plumber())
      // frontMatter messes up binary files and files with `---`.
      .pipe(
        condition(
          `${process.cwd()}/source/**/*.{markdown,md,textile}`,
          frontMatter()
        )
      )
      .pipe(
        condition(
          `${process.cwd()}/source/**/*.{markdown,md}`,
          markdown({ renderer })
        )
      )
      .pipe(layout(config))
      .pipe(gulp.dest(publicDir))
  );
});

// Compile blog posts, create index and archive pages.
gulp.task("posts", ["css"], () => {
  const config = {
    ...siteConfig,
    css
  };

  // Aggregates posts and render index and archive pages.
  const aggregator = index(config);
  aggregator.pipe(gulp.dest("./public"));

  return gulp
    .src("source/_posts/*.{markdown,textile}")
    .pipe(plumber())
    .pipe(frontMatter())
    .pipe(
      condition(
        `${__dirname}/source/**/*.{markdown,md}`,
        markdown({ renderer })
      )
    )
    .pipe(condition(`${__dirname}/source/**/*.textile`, textile()))
    .pipe(cleanUrl())
    .pipe(branch(aggregator))
    .pipe(layout(config))
    .pipe(gulp.dest(path.join("./public", siteConfig.blogDir)));
});

gulp.task("clean", cb => {
  del([publicDir], cb);
});

// Build the site, launch a dev server and watch changes.
gulp.task("watch", ["default"], () => {
  server("./public").listen(4000, err => {
    if (err) {
      gutil.log(err);
      return;
    }
    gutil.log("Listening on port 4000");
    gulp.watch(["./source/**/*.*", "!./source/_{css,posts}/**/*.*"], ["copy"]);
    gulp.watch("./source/_{posts,layouts,css}/*.*", ["posts", "copy"]);
  });
});

// Create a new post source file.
gulp.task("newpost", () => {
  if (!args.title) {
    gutil.log('Specify title: gulp newpost --title "Hello World"');
    return;
  }
  newPost(args.title, siteConfig);
});

// Create a new page source file.
gulp.task("newpage", () => {
  if (!args.filename) {
    gutil.log('Specify filename: gulp newpage --filename "hello"');
    return;
  }

  newPage(args.filename, siteConfig);
});

gulp.task("build", ["copy", "posts"]);

gulp.task("default", ["build"]);
