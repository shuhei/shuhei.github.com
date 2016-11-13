import React from 'react';
import Helmet from 'react-helmet';

import Post from './Post';
import Comments from './Comments';
import { SiteProps, PostTypes } from './types';

const PostPage = ({ site, post }) => {
  const title = [post.title, site.title].join(' - ');
  return (
    <div>
      <Helmet title={title} />
      <Post post={post} />
      {post.comments && <Comments />}
    </div>
  );
};

PostPage.propTypes = {
  site: SiteProps.isRequired,
  post: PostTypes.isRequired,
};

export default PostPage;
