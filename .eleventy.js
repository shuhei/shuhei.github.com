const { formatDate } = require("./lib/utils/date");
const { insertWbr } = require("./lib/utils/wbr");

module.exports = config => {
  config.addCollection("posts", api => {
    return api.getFilteredByGlob("source/_posts/*.md").reverse();
  });

  config.addFilter("formatDate", formatDate);
  config.addFilter("insertWbr", insertWbr);
  config.addFilter("join", (items, separator) => items.join(separator));

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
      output: "./_site"
    }
  };
};