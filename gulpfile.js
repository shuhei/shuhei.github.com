const path = require("path");

const { argv: args } = require("yargs");
const del = require("del");

const gulp = require("gulp");
const gutil = require("gulp-util");
const plumber = require("gulp-plumber");
const markdown = require("gulp-markdown");
const frontMatter = require("gulp-front-matter");
const textile = require("gulp-textile");

const gulpIf = require("gulp-if");
const server = require("./plugins/server");
const { index, layout, cleanUrl, newPost, newPage } = require("./plugins/blog");
const branch = require("./plugins/branch");
const readCssFiles = require("./plugins/css");
const renderer = require("./plugins/markdown-renderer");

const siteConfig = require("./source/_config/site.json");

const publicDir = "public";

// HACK: Build CSS and keep it in a variable.
let css;
async function buildCss() {
  css = await readCssFiles(siteConfig.cssFiles);
}

// Copy static pages compiling markdown files.
function copyFiles() {
  const config = {
    ...siteConfig,
    css
  };

  return (
    gulp
      .src(["source/**/*", "!source/_*", "!source/_*/**/*", "source/.nojekyll"])
      .pipe(plumber())
      // frontMatter messes up binary files and files with `---`.
      .pipe(gulpIf("**/*.{markdown,md,textile}", frontMatter()))
      .pipe(gulpIf(`**/*.{markdown,md}`, markdown({ renderer })))
      .pipe(layout(config))
      .pipe(gulp.dest(publicDir))
  );
}
const copy = gulp.series(buildCss, copyFiles);

// Compile blog posts, create index and archive pages.
function buildPosts() {
  const config = {
    ...siteConfig,
    css
  };

  // Aggregates posts and render index and archive pages.
  const aggregator = index(config);
  aggregator.pipe(gulp.dest(publicDir));

  return gulp
    .src("source/_posts/*.{markdown,md,textile}")
    .pipe(plumber())
    .pipe(frontMatter())
    .pipe(gulpIf("**/*.{markdown,md}", markdown({ renderer })))
    .pipe(gulpIf("**/*.textile", textile()))
    .pipe(cleanUrl())
    .pipe(branch(aggregator))
    .pipe(layout(config))
    .pipe(gulp.dest(path.join(publicDir, siteConfig.blogDir)));
}
const posts = gulp.series(buildCss, buildPosts);

function clean() {
  return del([publicDir]);
}

// Create a new post source file.
function newpost() {
  if (!args.title) {
    gutil.log('Specify title: gulp newpost --title "Hello World"');
    return;
  }
  newPost(args.title, siteConfig);
}

// Create a new page source file.
function newpage() {
  if (!args.filename) {
    gutil.log('Specify filename: gulp newpage --filename "hello"');
    return;
  }

  newPage(args.filename, siteConfig);
}

const build = gulp.parallel(copy, posts);

// Launch a dev server and watch changes.
function startWatch() {
  server(publicDir).listen(4000, err => {
    if (err) {
      gutil.log(err);
      return;
    }
    gutil.log("Listening on port 4000");
    gulp.watch(
      ["./source/**/*.*", "!./source/_{css,layouts,posts}/**/*.*"],
      copy
    );
    // TODO: Reload layout JavaScript files when they are changed.
    gulp.watch("./source/_{posts,layouts,css}/*.*", build);
  });
}
const watch = gulp.series(build, startWatch);

module.exports = {
  clean,
  copy,
  posts,
  newpost,
  newpage,
  build,
  watch,
  default: build
};
