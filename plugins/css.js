const fs = require("fs");
const util = require("util");
const postcss = require("postcss");
const clean = require("postcss-clean");
const customProperties = require("postcss-custom-properties");

const readFile = util.promisify(fs.readFile);

const processor = postcss([customProperties(), clean()]);

async function readCssFiles(filePaths) {
  const promises = filePaths.map(css => readFile(css, { encoding: "utf8" }));
  const concatenated = (await Promise.all(promises)).join("\n");
  const out = await processor.process(concatenated, {
    // No source map is necessary.
    from: undefined
  });
  return out.css;
}

module.exports = readCssFiles;
