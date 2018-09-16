const Post = require('./Post');
const Comments = require('./Comments');

const PostPage = ({ site, post }) => {
  const title = [post.title, site.title].join(' - ');
  const body = `
    <div>
      ${Post({ post })}
      ${post.comments ? Comments() : ''}
    </div>
  `;
  return {
    title,
    body,
  };
};

module.exports = PostPage;
