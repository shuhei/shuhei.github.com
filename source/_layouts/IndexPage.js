import React, { PropTypes } from 'react';

import Layout from './Layout';
import Post from './Post';
import { SiteProps, PostTypes } from './types';

const IndexPage = ({ site, posts, title, prevPage, nextPage }) => (
  <Layout site={site} title={title}>
    <div>
      {posts.map(post => <Post post={post} key={post.url} />)}
      <ul className="pagination">
        <li className="pagination__prev-page">
          {prevPage && <a href={prevPage}>Newer Posts</a>}
        </li>
        <li className="pagination__archives">
          <a href="/blog/archives">Archives</a>
        </li>
        <li className="pagination__next-page">
          {nextPage && <a href={nextPage}>Older Posts</a>}
        </li>
      </ul>
    </div>
  </Layout>
);

IndexPage.propTypes = {
  site: SiteProps.isRequired,
  posts: PropTypes.arrayOf(PostTypes).isRequired,
  title: PropTypes.string,
  prevPage: PropTypes.string,
  nextPage: PropTypes.string,
};

export default IndexPage;
