const Image = require("@11ty/eleventy-img");
const path = require("path");

const { createTitleImage, titleImageWidth } = require("../../lib/title-image");
const {
  extensionToFormat,
  imageOutputPathOptions,
  shouldOptimize
} = require("../../lib/transformers/imageopt");

// Provide common fields for all the posts.
module.exports = {
  layout: "layouts/post",
  eleventyComputed: {
    async image({ image, title, site }) {
      if (!shouldOptimize) {
        // Skip slow image generation and optimization.
        return null;
      }

      let source;
      let format;
      if (image) {
        // Use the `image` from front matter if possible.
        source = "source" + image;
        format = extensionToFormat[path.extname(source)];
      } else {
        // Otherwise, generate a title image.
        source = createTitleImage(title, site.twitter.subtitle);
        // Convert SVG to PNG.
        format = "png";
      }

      if (!format) {
        throw new Error(`Unsupported title image format: ${source}`);
      }

      // Resize and optimize the image.
      const stats = await Image(source, {
        formats: [format],
        widths: [titleImageWidth],
        ...imageOutputPathOptions
      });
      if (!stats[format] || stats[format].length !== 1) {
        throw new Error(
          `Invalid title image optimization result: ${JSON.stringify(stats)}`
        );
      }
      return stats[format][0].url;
    }
  }
};
