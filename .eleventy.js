const { postcss } = require("./lib/filters/css");
const { formatDate } = require("./lib/filters/date");
const { blogPermalink, indexPermalink } = require("./lib/filters/permalink");
const { titleImage } = require("./lib/filters/title-image");
const { normalizeUrl } = require("./lib/filters/url");
const { insertWbr } = require("./lib/filters/wbr");
const { getMarkdownIt } = require("./lib/plugins/markdown");
const { htmlmin } = require("./lib/transformers/htmlmin");
const { imageopt } = require("./lib/transformers/imageopt");

module.exports = config => {
  config.setQuietMode(true);
  config.setDataDeepMerge(true);

  config.setLibrary("md", getMarkdownIt());

  config.addCollection("posts", api => {
    return api.getFilteredByGlob("source/posts/*.md").reverse();
  });

  config.addFilter("formatDate", formatDate);
  config.addFilter("insertWbr", insertWbr);
  config.addFilter("join", (items, separator) => items.join(separator));
  config.addFilter("blogPermalink", blogPermalink);
  config.addFilter("indexPermalink", indexPermalink);
  config.addFilter("normalizeUrl", normalizeUrl);
  config.addNunjucksAsyncFilter("postcss", postcss);
  config.addJavaScriptFunction("titleImage", titleImage);

  config.addTransform("imagemin", imageopt);
  config.addTransform("htmlmin", htmlmin);

  // Paththrough copy files paths are relative to the project root.
  config.addPassthroughCopy("source/images");
  config.addPassthroughCopy("source/ng2src");
  config.addPassthroughCopy("source/talks");
  config.addPassthroughCopy("source/works");
  config.addPassthroughCopy("source/.nojekyll");
  config.addPassthroughCopy("source/CNAME");
  config.addPassthroughCopy("source/favicon.ico");

  return {
    dir: {
      input: "./source",
      output: "./public"
    }
  };
};
