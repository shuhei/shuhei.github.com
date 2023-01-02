const fs = require("fs").promises;
const postcss = require("postcss");
const cssnano = require("cssnano");
const customProperties = require("postcss-custom-properties");
const Cache = require("@11ty/eleventy-cache-assets");

// A change in source/_includes/css triggers full page reload while a change
// in source/css triggers only *.css reload in BrowserSync.
const baseCssFile = "source/_includes/css/style.css";

const fontsCssUrl =
  "https://fonts.googleapis.com/css2?display=swap&family=Libre+Baskerville:ital@0;1&family=Libre+Franklin:wght@700&family=DM+Mono";
const chromeUserAgent =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36";

async function getFontsCss() {
  const css = await Cache(fontsCssUrl, {
    duration: "1d",
    type: "text",
    fetchOptions: {
      headers: {
        // Set Chrome UA to get CSS with woff2 files. Otherwise we get ttf.
        // We don't support web fonts on legacy browsers.
        "user-agent": chromeUserAgent
      }
    }
  });
  return css;
}

// Pick up latin font URLs from Google Fonts CSS.
function getFontFilesToPreload(fontsCss) {
  const root = postcss.parse(fontsCss);
  const files = [];
  for (let i = 0; i < root.nodes.length; i += 2) {
    const commentNode = root.nodes[i];
    const fontFaceNode = root.nodes[i + 1];
    if (
      commentNode.type === "comment" &&
      commentNode.text.trim() === "latin" &&
      fontFaceNode.type === "atrule" &&
      fontFaceNode.name === "font-face"
    ) {
      const src = fontFaceNode.nodes.find(n => n.prop === "src");
      // Extract an URL from `url()`
      const matches = src.value.match(/url\(([^)]+)\)/);
      if (matches) {
        files.push(matches[1]);
      }
    }
  }
  return files;
}

async function provideStyle() {
  const processor = postcss([
    customProperties(),
    cssnano({
      preset: "default"
    })
  ]);

  const [styleCss, fontsCss] = await Promise.all([
    fs.readFile(baseCssFile, "utf8"),
    getFontsCss()
  ]);

  const concatenated = [styleCss, fontsCss].join("\n");
  const css = await processor.process(concatenated, {
    // No source map is necessary.
    from: undefined
  });

  const fontFiles = getFontFilesToPreload(fontsCss);

  return {
    css,
    fontFiles
  };
}

module.exports = provideStyle;
