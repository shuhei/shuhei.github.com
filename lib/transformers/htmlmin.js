const htmlMinifier = require("html-minifier");

function htmlmin(content, outputPath) {
  if (outputPath.endsWith("html")) {
    return htmlMinifier.minify(content, {
      useShortDoctype: true,
      removeComments: true,
      collapseWhitespace: true
    });
  }
  return content;
}

module.exports = {
  htmlmin
};
