const { JSDOM } = require("jsdom");
const Image = require("@11ty/eleventy-img");
const util = require("util");
const sizeOf = util.promisify(require("image-size"));

async function handleImg(img) {
  const alt = img.getAttribute("alt");
  let src = img.getAttribute("src");
  if (src.startsWith("/")) {
    src = "source" + src;
  }

  // Image.generateHTML() doesn't support gif, and Image messes up animated gif.
  if (src.endsWith(".gif")) {
    img.setAttribute("loading", "lazy");
    img.setAttribute("decoding", "async");
    if (src.startsWith("source/")) {
      const { width, height } = await sizeOf(src);
      img.setAttribute("width", width);
      img.setAttribute("height", height);
    }
    return;
  }

  let stats;
  try {
    stats = await Image(src, {
      formats: ["avif", "webp", null],
      // The lowest one is used for width/height of <img>. It shouldn't be
      // smaller than the biggest logical width.
      widths: [700, 900, 1100, 1400, null],
      urlPath: "/images/",
      outputDir: "./public/images/"
    });
  } catch (e) {
    console.log("[imageopt] Failed to optimize image", src, e);
    return;
  }

  const wrapper = img.ownerDocument.createElement("div");
  wrapper.classList.add("img-wrapper");
  wrapper.innerHTML = Image.generateHTML(stats, {
    alt,
    // On mobile, it's full width minus 20px padding x 2.
    // On bigger screens, it's fixed.
    sizes: "(max-width: 767px) calc(100vw - 40px), 700px",
    loading: "lazy",
    decoding: "async"
  });
  img.parentNode.replaceChild(wrapper, img);
}

async function imageopt(content, outputPath) {
  if (!outputPath.endsWith(".html")) {
    return content;
  }

  const dom = new JSDOM(content);
  const imgs = [...dom.window.document.querySelectorAll("img")];
  if (imgs.length > 0) {
    await Promise.all(imgs.map(img => handleImg(img)));
    return dom.serialize();
  }

  return content;
}

module.exports = {
  imageopt
};
