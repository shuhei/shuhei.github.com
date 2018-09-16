const PagePage = ({ site, post }) => {
  // TODO: Use title.
  const title = [post.title, site.title].join(' - ');

  return `
    <div>
      <div class="post">
        <div class="post-header">
          <h1 class="title">
            ${post.title}
          </h1>
          <div class="content">
            ${post.content}
          </div>
        </div>
      </div>
    </div>
  `;
};

module.exports = PagePage;
