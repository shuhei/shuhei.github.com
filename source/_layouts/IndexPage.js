const Post = require("./Post");

const IndexPage = ({ posts, title, prevPage, nextPage }) => {
  const prevLink = prevPage ? `<a href=${prevPage}>Newer Posts</a>` : "";
  const nextLink = nextPage ? `<a href=${nextPage}>Older Posts</a>` : "";
  const body = `
    ${posts.map(post => Post({ post })).join("\n")}
    <ul class="pagination">
      <li class="pagination__prev-page">
        ${prevLink}
      </li>
      <li class="pagination__archives">
        <a href="/blog/archives/">Archives</a>
      </li>
      <li class="pagination__next-page">
        ${nextLink}
      </li>
    </ul>
  `;
  return {
    title,
    body
  };
};

module.exports = IndexPage;
