const { formatDate } = require("./lib/utils/date");
const { insertWbr } = require("./lib/utils/wbr");

module.exports = config => {
  config.addCollection("posts", api => {
    return api.getFilteredByGlob("source/_posts/*.md").reverse();
  });
  config.addFilter("formatDate", formatDate);
  config.addFilter("insertWbr", insertWbr);
  config.addFilter("join", (items, separator) => items.join(separator));
  return {
    // templateFormats: ["md", "njk"],
    // htmlTemplateEngine: "njk",
    dir: {
      input: "./source",
      output: "./_site"
    }
  };
};
