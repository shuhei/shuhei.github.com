const { formatDate } = require("./date");

const ArchivePost = ({ post }) => {
  const date = formatDate(post.date);
  return `
    <div class="post-list-item">
      <div class="post-list-item__date">
        ${date}
      </div>
      <div class="post-list-item__title">
        <a href=${post.url}>${post.title}</a>
      </div>
    </div>
  `;
};

const ArchivesPage = ({ site, posts }) => {
  const title = ["Archives", site.title].join(" - ");
  const postList = posts.map(post => ArchivePost({ post })).join("\n");
  const body = `
    <div class="post-list">
      <h1 class="title">
        <a href="/blog/archives">Archives</a>
      </h1>
      ${postList}
    </div>
  `;
  return {
    title,
    body
  };
};

module.exports = ArchivesPage;
