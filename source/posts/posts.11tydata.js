// Filters are not available in .11tydata.js.
const { blogPermalink } = require("../../lib/filters/permalink");

// Provide common fields for all the posts.
module.exports = {
  layout: "layouts/post",
  eleventyComputed: {
    image({ image, page }) {
      // Use the `image` from front matter or one generated by
      // `blog/title-image.11ty.js`.
      return image || `/${blogPermalink(page, "title.png")}`;
    }
  }
};
