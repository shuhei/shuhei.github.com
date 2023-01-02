const { JSDOM } = require("jsdom");
const Image = require("@11ty/eleventy-img");
const util = require("util");
const path = require("path");
const sharp = require("sharp");
const DatauriParser = require("datauri/parser");
const sizeOf = util.promisify(require("image-size"));

const shouldOptimize = !!process.env.OPTIMIZE;

/**
 * File extension to a format name that eleventy-img understands.
 *
 * Not including .gif because eleventy-img messes up animated gif.
 */
const extensionToFormat = {
  ".jpeg": "jpeg",
  ".jpg": "jpeg",
  ".png": "png"
};

/**
 * eleventy-img options for image output path and URL.
 *
 * Useful for outputting images into the `cached` directory where images can be
 * cached indefinitely.
 */
const imageOutputPathOptions = {
  urlPath: "/cached/",
  outputDir: "./public/cached/"
};

async function handleImg(img) {
  const alt = img.getAttribute("alt");
  let src = img.getAttribute("src");
  if (src.startsWith("/")) {
    src = "source" + src;
  }

  const format = extensionToFormat[path.extname(src)];
  if (!format) {
    img.setAttribute("loading", "lazy");
    img.setAttribute("decoding", "async");
    if (src.startsWith("source/")) {
      const { width, height } = await sizeOf(src);
      img.setAttribute("width", width);
      img.setAttribute("height", height);
    }
    return;
  }

  const imageOptions = {
    // The nextgen image formats, especially avif, are really slow to generate.
    // Disable them by default for better author experience.
    formats: shouldOptimize ? ["avif", "webp", format] : [format],
    // The lowest one is used for width/height of <img>. It shouldn't be
    // smaller than the biggest logical width (700px).
    // Also, the maximum size is 700px * 2 to support up to 2x displays.
    widths: [700, 900, 1100, 1400],
    ...imageOutputPathOptions
  };

  let stats;
  try {
    stats = await Image(src, imageOptions);
  } catch (err) {
    console.error("[imageopt] Failed to optimize image", src, err);
    return;
  }

  if (img.parentNode.childNodes.length > 1) {
    // This is enfoced by the markdown plugin.
    console.error("[imageopt] <img> shouldn't have siblings", src);
    return;
  }
  const placeholder = await createBlurryPlaceholder(src);
  img.parentNode.innerHTML = Image.generateHTML(stats, {
    alt,
    // On mobile, it's full width minus 20px padding x 2.
    // On bigger screens, it's fixed.
    sizes: "(max-width: 767px) calc(100vw - 40px), 700px",
    loading: "lazy",
    decoding: "async",
    style: `background-size: cover; background-image: url('${placeholder}')`
  });
}

async function createBlurryPlaceholder(src) {
  const { width, height } = await sizeOf(src);
  // Calculate the dimensions of the placeholder image.
  //
  // Target pixels:
  //   w * h = targetPixels
  // Keep aspect ratio:
  //   w / h = width / height
  //
  // w = targetPixels / h
  // w = h * width / height
  // -> targetPixels / h = h * width / height
  // -> h = sqrt(targetPixels * height / width)
  const targetPixels = 60;
  const h = Math.round(Math.sqrt((targetPixels * height) / width));
  const w = Math.round(targetPixels / h);

  // Create a PNG thumbnail.
  const pngBuffer = await sharp(src).resize(w, h).png().toBuffer();

  // Wrap the PNG with an SVG to apply blur.
  const dataUriParser = new DatauriParser();
  const pngDataUri = dataUriParser.format(".png", pngBuffer).content;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    viewBox="0 0 ${w} ${h}">
    <filter id="b" color-interpolation-filters="sRGB">
      <feGaussianBlur stdDeviation=".5"></feGaussianBlur>
      <feComponentTransfer>
        <feFuncA type="discrete" tableValues="1 1"></feFuncA>
      </feComponentTransfer>
    </filter>
    <image filter="url(#b)" x="0" y="0"
      height="100%" width="100%"
      xlink:href="${pngDataUri}">
    </image>
  </svg>`;
  return dataUriParser.format(".svg", svg).content;
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
  extensionToFormat,
  imageopt,
  imageOutputPathOptions,
  shouldOptimize
};
