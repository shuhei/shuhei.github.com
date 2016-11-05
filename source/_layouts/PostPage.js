import React, { PropTypes } from 'react';

import Layout from './Layout';
import Post from './Post';
import Comments from './Comments';
import { PostTypes } from './types';

const PostPage = ({ site, post }) => {
  const title = [post.title, site.title].join(' - ');
  return (
    <Layout site={site} title={title}>
      <Post post={post} isPostPage />
      {post.comments && <Comments />}
    </Layout>
  );
};

PostPage.propTypes = {
  post: PostTypes,
};

export default PostPage;
