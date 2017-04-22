import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';

import { handleLink } from '../_js/link';
import { SiteProps, ArchivePostTypes } from './types';

const ArchivePost = ({ post }) => (
  <div className="post-list-item">
    <div className="post-list-item__date">
      {post.date.split(' ')[0]}
    </div>
    <div className="post-list-item__title">
      <a href={post.url} onClick={handleLink}>{post.title}</a>
    </div>
  </div>
);

ArchivePost.propTypes = {
  post: ArchivePostTypes.isRequired,
};

const ArchivesPage = ({ site, posts }) => {
  const title = ['Archives', site.title].join(' - ');
  return (
    <div>
      <Helmet title={title} />
      <div className="post-list">
        <h1 className="title">
          <a href="/blog/archives">Archives</a>
        </h1>
        {posts.map(post => <ArchivePost post={post} key={post.url} />)}
      </div>
    </div>
  );
};

ArchivesPage.propTypes = {
  site: SiteProps.isRequired,
  posts: PropTypes.arrayOf(ArchivePostTypes).isRequired,
};

export default ArchivesPage;
