const { JSDOM } = require("jsdom");
const Image = require("@11ty/eleventy-img");
const util = require("util");
const sizeOf = util.promisify(require("image-size"));

const shouldOptimize = !!process.env.OPTIMIZE;

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
      // Those image formats are really slow to generate. Especially avif.
      // Disable them by default for better author experience.
      formats: shouldOptimize ? ["avif", "webp", null] : [null],
      // The lowest one is used for width/height of <img>. It shouldn't be
      // smaller than the biggest logical width (700px).
      // Also, the maximum size is 700px * 2 to support up to 2x displays.
      widths: [700, 900, 1100, 1400],
      urlPath: "/images/",
      outputDir: "./public/images/"
    });
  } catch (e) {
    console.log("[imageopt] Failed to optimize image", src, e);
    return;
  }

  if (img.parentNode.childNodes.length > 1) {
    // This is enfoced by the markdown plugin.
    console.log("[imageopt] <img> shouldn't have siblings", src);
    return;
  }
  img.parentNode.innerHTML = Image.generateHTML(stats, {
    alt,
    // On mobile, it's full width minus 20px padding x 2.
    // On bigger screens, it's fixed.
    sizes: "(max-width: 767px) calc(100vw - 40px), 700px",
    loading: "lazy",
    decoding: "async"
  });
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
