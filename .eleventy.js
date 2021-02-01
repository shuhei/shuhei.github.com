const { htmlmin } = require("./lib/transformers/htmlmin");
const { formatDate } = require("./lib/utils/date");
const { insertWbr } = require("./lib/utils/wbr");
const { applyPostcss } = require("./lib/plugins/css");
const { getMarkdownIt } = require("./lib/plugins/markdown");
const { blogPermalink, indexPermalink } = require("./lib/plugins/permalink");

module.exports = config => {
  config.setQuietMode(true);
  config.setDataDeepMerge(true);

  config.setLibrary("md", getMarkdownIt());

  config.addCollection("posts", api => {
    return api.getFilteredByGlob("source/posts/*.md").reverse();
  });

  config.addFilter("formatDate", formatDate);
  config.addFilter("insertWbr", insertWbr);
  config.addNunjucksAsyncFilter("postcss", applyPostcss);
  config.addFilter("join", (items, separator) => items.join(separator));
  config.addFilter("blogPermalink", blogPermalink);
  config.addFilter("indexPermalink", indexPermalink);

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
