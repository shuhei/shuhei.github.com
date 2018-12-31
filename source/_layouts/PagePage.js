const PagePage = ({ site, post }) => {
  const title = [post.title, site.title].join(" - ");
  const body = `
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
  return {
    title,
    body
  };
};

module.exports = PagePage;
