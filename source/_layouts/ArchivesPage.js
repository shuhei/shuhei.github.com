const ArchivePost = ({ post }) => {
  const date = post.date.split(' ')[0];
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
  // TODO: Use title.
  const title = ['Archives', site.title].join(' - ');
  const postList = posts.map(post => ArchivePost({ post })).join('\n');
  return `
    <div>
      <div class="post-list">
        <h1 class="title">
          <a href="/blog/archives">Archives</a>
        </h1>
        ${postList}
      </div>
    </div>
  `;
};

module.exports = ArchivesPage;
