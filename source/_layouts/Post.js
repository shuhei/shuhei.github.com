import React from 'react';

import SocialButtons from './SocialButtons';
import { PostTypes } from './types';

const Post = ({ post, isPostPage }) => {
  const categories = [...(post.categories || []).map((category, i) => [
    i === 0 ? ' - ' : ', ',
    <span className="category">{category}</span>
  ])];
  const content = { __html: post.content };

  return (
    <div className="post">
      <div className="post-header">
        <h1 className="title">
          <a href={post.url}>{post.title}</a>
        </h1>
        <div className="meta">
          @
          <span className="date">{post.date}</span>
          {categories}
        </div>
      </div>
      <div className="content">
        <div dangerouslySetInnerHTML={content} />
        {isPostPage && <SocialButtons title={post.title} />}
      </div>
    </div>
  );
};

Post.propTypes = {
  post: PostTypes,
};

export default Post;
