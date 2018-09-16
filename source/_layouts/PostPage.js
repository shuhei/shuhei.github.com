const Post = require('./Post');
const Comments = require('./Comments');

const PostPage = ({ site, post }) => {
  // TODO: Return title.
  const title = [post.title, site.title].join(' - ');
  return `
    <div>
      ${Post({ post })}
      ${post.comments ? Comments() : ''}
    </div>
  `;
};

module.exports = PostPage;
