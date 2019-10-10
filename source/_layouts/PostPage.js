const Post = require("./Post");
const Comments = require("./Comments");

const PostPage = ({ site, post }) => {
  const title = [post.title, site.title].join(" - ");
  const body = `
    ${Post({ post })}
    ${post.comments ? Comments() : ""}
  `;
  return {
    title,
    body,
    image: post.image,
    description: post.description
  };
};

module.exports = PostPage;
