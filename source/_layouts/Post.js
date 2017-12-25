import React from 'react';

import { handleLink } from '../_js/link';
import { PostTypes } from './types';

const Post = ({ post }) => {
  const categories = [...(post.categories || []).map((category, i) => [
    i === 0 ? ' - ' : ', ',
    <span className="category" key={category}>{category}</span>,
  ])];
  const content = { __html: post.content };

  return (
    <div className="post">
      <div className="post-header">
        <h1 className="title">
          <a href={post.url} onClick={handleLink}>{post.title}</a>
        </h1>
        <div className="meta">
          @
          <span className="date">{post.date}</span>
          {categories}
        </div>
      </div>
      <div className="content">
        <div dangerouslySetInnerHTML={content} />
      </div>
    </div>
  );
};

Post.propTypes = {
  post: PostTypes,
};

export default Post;
