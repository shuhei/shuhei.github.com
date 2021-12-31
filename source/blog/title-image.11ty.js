const Image = require("@11ty/eleventy-img");

class TitleImage {
  data() {
    return {
      pagination: {
        data: "collections.posts",
        size: 1
      },
      permalink: function(data) {
        const page = data.pagination.items[0];
        return this.blogPermalink(page, "title.png");
      }
    };
  }

  async render(data) {
    const page = data.pagination.items[0];
    const image = page.data.image;
    // Optimizing explicitly specified OG image here.
    // TODO: Do this at a proper place.
    if (image.startsWith("/images/") && image.endsWith(".jpg")) {
      try {
        const stats = await Image("source" + image, {
          formats: ["jpeg"],
          widths: [800],
          urlPath: "/cached/",
          outputDir: "./public/cached/"
        });
        if (stats.jpeg[0]) {
          // TODO: Don't mutate...
          page.data.image = stats.jpeg[0].url;
          return Buffer.from([]);
        }
      } catch (err) {
        console.error(
          "[title-image] Failed to optimize title image",
          image,
          err
        );
      }
    }
    return this.titleImage(page.data.title, data.site.twitter.subtitle);
  }
}

module.exports = TitleImage;
