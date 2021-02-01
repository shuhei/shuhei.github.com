const fs = require("fs").promises;
const { JSDOM } = require("jsdom");
const path = require("path");
const util = require("util");
const sizeOf = util.promisify(require("image-size").imageSize);

async function handleImg(img, outputPath) {
  img.setAttribute("loading", "lazy");
  img.setAttribute("decoding", "async");

  // Wrap the image with a div for a design purpose.
  const wrapper = img.ownerDocument.createElement("div");
  wrapper.classList.add("img-wrapper");
  img.parentNode.replaceChild(wrapper, img);
  wrapper.appendChild(img);

  // Set width and height to keep aspect ratio.
  const src = img.getAttribute("src");
  if (!src.startsWith("/")) {
    return;
  }
  const imagePath = path.resolve("source" + src);
  let dimensions;
  try {
    dimensions = await sizeOf(imagePath);
  } catch (e) {
    console.log(
      `[imagemin] Failed to get size of ${imagePath} at ${outputPath}`,
      e
    );
    return;
  }
  if (!img.hasAttribute("width")) {
    img.setAttribute("width", dimensions.width);
    img.setAttribute("height", dimensions.height);
  }
}

async function imageopt(content, outputPath) {
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
  imageopt
};
