import React, { PropTypes } from 'react';
import Helmet from 'react-helmet';

import Post from './Post';
import { handleLink } from '../_js/link';
import { PostTypes } from './types';

const IndexPage = ({ posts, title, prevPage, nextPage }) => (
  <div>
    <Helmet title={title} />
    {posts.map(post => <Post post={post} key={post.url} />)}
    <ul className="pagination">
      <li className="pagination__prev-page">
        {prevPage && <a href={prevPage} onClick={handleLink}>Newer Posts</a>}
      </li>
      <li className="pagination__archives">
        <a href="/blog/archives">Archives</a>
      </li>
      <li className="pagination__next-page">
        {nextPage && <a href={nextPage} onClick={handleLink}>Older Posts</a>}
      </li>
    </ul>
  </div>
);

IndexPage.propTypes = {
  posts: PropTypes.arrayOf(PostTypes).isRequired,
  title: PropTypes.string,
  prevPage: PropTypes.string,
  nextPage: PropTypes.string,
};

export default IndexPage;
