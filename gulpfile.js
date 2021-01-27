const path = require("path");
const util = require("util");

const { argv: args } = require("yargs");
const Stream = require("readable-stream");

const gulp = require("gulp");
const gutil = require("gulp-util");
const markdown = require("gulp-markdown");
const frontMatter = require("gulp-front-matter");

const gulpIf = require("gulp-if");
const startServer = require("./lib/plugins/serve");
const {
  index,
  layout,
  cleanUrl,
  newPost,
  newPage
} = require("./lib/plugins/blog");
const branch = require("./lib/plugins/branch");
const readCssFiles = require("./lib/plugins/css");
const readImageSizes = require("./lib/plugins/image-size");
const summarize = require("./lib/plugins/summarize");
const MarkdownRenderer = require("./lib/plugins/markdown-renderer");
const siteConfig = require("./source/_config/site.json");

const pipeline = util.promisify(Stream.pipeline);

const publicDir = "public";

const renderer = new MarkdownRenderer({
  localImagePrefix: "/images/"
});

// HACK: Build CSS and keep it in a variable.
let css;
async function buildCss() {
  css = await readCssFiles(siteConfig.cssFiles);
}

async function checkImageSizes() {
  const imageSizes = await readImageSizes("./source/images");
  renderer.setImageSizes(imageSizes);
}

// Copy static pages compiling markdown files.
function copyFiles() {
  const config = {
    ...siteConfig,
    css
  };

  return pipeline(
    gulp.src([
      "source/**/*",
      "!source/_*",
      "!source/_*/**/*",
      "source/.nojekyll"
    ]),
    // Apply frontMatter only to whitelisted files because it messes up binary
    // files and files with `---`.
    gulpIf("**/*.{markdown,md}", frontMatter()),
    gulpIf(`**/*.{markdown,md}`, markdown({ renderer })),
    layout(config),
    gulp.dest(publicDir)
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

  return pipeline(
    gulp.src("source/_posts/*.{markdown,md}"),
    frontMatter(),
    markdown({ renderer }),
    cleanUrl(),
    branch(aggregator),
    summarize({
      hostname: siteConfig.hostname,
      blogDir: siteConfig.blogDir
    }),
    layout(config),
    gulp.dest(path.join(publicDir, siteConfig.blogDir))
  );
}
const postsDeps = gulp.parallel(buildCss, checkImageSizes);
const posts = gulp.series(postsDeps, buildPosts);

// Create a new post source file.
function newpost() {
  if (typeof args.title !== "string") {
    gutil.log('Specify title: gulp newpost --title "Hello World"');
    process.exit(1);
  }
  return newPost(args.title, siteConfig);
}

// Create a new page source file.
function newpage() {
  if (typeof args.filename !== "string") {
    gutil.log('Specify filename: gulp newpage --filename "hello"');
    process.exit(1);
  }

  return newPage(args.filename, siteConfig);
}

const build = gulp.parallel(copy, posts);

function serve() {
  return startServer(publicDir);
}

function startWatching() {
  gulp.watch(
    ["./source/**/*.*", "!./source/_{css,layouts,posts}/**/*.*"],
    copy
  );
  // TODO: Reload layout JavaScript files when they are changed.
  gulp.watch("./source/_{posts,layouts,css}/*.*", build);
}

const watch = gulp.series(build, serve, startWatching);

// Task dependencies:
//
// watch (serial)
//   build (parallel)
//    copy (serial)
//      buildCss
//      copyFiles
//    posts (serial)
//      postsDeps (parallel)
//        buildCss
//        checkImageSizes
//      buildPosts
//   serve
//   startWatching (parallel)
//    copy
//    build (parallel)
//      copy (see above)
//      posts (see above)
//  newpost
//  newpage

module.exports = {
  copy,
  posts,
  newpost,
  newpage,
  build,
  watch,
  serve,
  default: build
};
