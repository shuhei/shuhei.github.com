const postcss = require("postcss");
const clean = require("postcss-clean");
const customProperties = require("postcss-custom-properties");

const processor = postcss([customProperties(), clean()]);

// Apply postcss to the concatenated file.
async function applyPostcss(css, callback) {
  try {
    const out = await processor.process(css, {
      // No source map is necessary.
      from: undefined
    });
    callback(null, out.css);
  } catch (e) {
    callback(e);
  }
}

module.exports = {
  postcss: applyPostcss
};
