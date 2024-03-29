const pluginRss = require("@11ty/eleventy-plugin-rss");

const { formatDate } = require("./lib/filters/date");
const { blogPermalink, indexPermalink } = require("./lib/filters/permalink");
const { normalizeUrl } = require("./lib/filters/url");
const { insertWbr } = require("./lib/filters/wbr");
const { getMarkdownIt } = require("./lib/plugins/markdown");
const { htmlmin } = require("./lib/transformers/htmlmin");
const { imageopt } = require("./lib/transformers/imageopt");

const shouldOptimize = !!process.env.OPTIMIZE;

module.exports = config => {
  config.setQuietMode(true);
  config.setDataDeepMerge(true);

  config.addPlugin(pluginRss);

  config.setLibrary("md", getMarkdownIt());

  config.addCollection("posts", api => {
    return api.getFilteredByGlob("source/posts/*.md").reverse();
  });
  config.addCollection("tags", api => {
    const tagCounts = new Map();
    for (const post of api.getAll()) {
      if (!post.data.tags) continue;
      for (const tag of post.data.tags) {
        if (tagCounts.has(tag)) {
          tagCounts.set(tag, tagCounts.get(tag) + 1);
        } else {
          tagCounts.set(tag, 1);
        }
      }
    }
    return [...tagCounts.entries()].sort((a, b) => {
      if (a[1] !== b[1]) return b[1] - a[1];
      return a[0].localeCompare(b[0]);
    });
  });

  config.addFilter("formatDate", formatDate);
  config.addFilter("insertWbr", insertWbr);
  config.addFilter("limit", (items, count) => items.slice(0, count));
  config.addFilter("blogPermalink", blogPermalink);
  config.addFilter("indexPermalink", indexPermalink);
  config.addFilter("normalizeUrl", normalizeUrl);

  if (shouldOptimize) {
    config.addTransform("imageopt", imageopt);
    config.addTransform("htmlmin", htmlmin);
  }

  // Paththrough copy files paths are relative to the project root.
  // Only .gif files are necessary to copy in images.
  config.addPassthroughCopy("source/images");
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
