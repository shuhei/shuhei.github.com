const htmlMinifier = require("html-minifier");

function htmlmin(content, outputPath) {
  if (!outputPath.endsWith(".html")) {
    return content;
  }

  return htmlMinifier.minify(content, {
    useShortDoctype: true,
    removeComments: true,
    collapseWhitespace: true
  });
}

module.exports = {
  htmlmin
};
