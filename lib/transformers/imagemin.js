const fs = require("fs").promises;
const { JSDOM } = require("jsdom");
const path = require("path");
const util = require("util");
const sizeOf = util.promisify(require("image-size").imageSize);

async function handleImg(img, outputPath) {
  if (!img.src.startsWith("/")) {
    return;
  }
  const src = path.resolve("source" + img.src);
  let dimensions;
  try {
    dimensions = await sizeOf(src);
  } catch (e) {
    console.log(`[imagemin] Failed to get size of ${src} at ${outputPath}`, e);
    return;
  }
  if (!img.hasAttribute("width")) {
    img.setAttribute("width", dimensions.width);
    img.setAttribute("height", dimensions.height);
  }
}

async function imagemin(content, outputPath) {
  if (!outputPath.endsWith(".html")) {
    return content;
  }

  const dom = new JSDOM(content);
  const imgs = [...dom.window.document.querySelectorAll("img")];
  if (imgs.length > 0) {
    await Promise.all(imgs.map(img => handleImg(img, outputPath)));
    return dom.serialize();
  }

  return content;
}

module.exports = {
  imagemin
};
