import React, { PropTypes } from 'react';

import Layout from './Layout';
import { SiteProps, PostTypes } from './types';

const ArchivePost = ({ post }) => (
  <div className="post-list-item">
    <div className="post-list-item__date">
      {post.date.split(' ')[0]}
    </div>
    <div className="post-list-item__title">
      <a href={post.url}>{post.title}</a>
    </div>
  </div>
);

ArchivePost.propTypes = {
  post: PostTypes.isRequired,
};

const ArchivesPage = ({ site, posts }) => {
  const title = ['Archives', site.title].join(' - ');
  return (
    <Layout site={site} title={title}>
      <div className="post-list">
        <h1 className="title">
          <a href="/blog/archives">Archives</a>
        </h1>
        {posts.map(post => <ArchivePost post={post} key={post.url} />)}
      </div>
    </Layout>
  );
};

ArchivesPage.propTypes = {
  site: SiteProps.isRequired,
  posts: PropTypes.arrayOf(PostTypes).isRequired,
};

export default ArchivesPage;
