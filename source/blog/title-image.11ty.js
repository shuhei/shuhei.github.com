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
    return this.titleImage(page.data.title, data.site.title);
  }
}

module.exports = TitleImage;
