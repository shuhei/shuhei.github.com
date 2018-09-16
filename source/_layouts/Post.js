const Post = ({ post }) => {
  const categories = (post.categories || []).map(category => (
    `<span class="category">${category}</span>`
  )).join(', ');

  return `
    <div class="post">
      <div class="post-header">
        <h1 class="title">
          <a href=${post.url}>${post.title}</a>
        </h1>
        <div class="meta">
          <span class="date">${post.date}</span>
          ${categories.length > 0 ? `- ${categories}` : ''}
        </div>
      </div>
      <div class="content">
        <div>
          ${post.content}
        </div>
      </div>
    </div>
  `;
};

module.exports = Post;
