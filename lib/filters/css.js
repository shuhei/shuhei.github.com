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

// This shaves 2 to 3 seconds on M1 Macbook Air.
function cachify(asyncFunc) {
  // Rudimentary in-memory cache.
  const cache = new Map();
  // Assuming that the arg can be a cache key by itself.
  // For example, a string.
  return (arg, callback) => {
    if (!cache.has(arg)) {
      // Cache a promise because this function is called many times with a same
      // key before its result is populated.
      const promise = new Promise((resolve, reject) => {
        asyncFunc(arg, (err, value) => {
          if (err) {
            reject(err);
          } else {
            resolve(value);
          }
        });
      });
      cache.set(arg, promise);
    }

    const cached = cache.get(arg);
    cached.then(
      value => {
        callback(null, value);
      },
      err => {
        callback(err);
      }
    );
  };
}

module.exports = {
  postcss: cachify(applyPostcss)
};
