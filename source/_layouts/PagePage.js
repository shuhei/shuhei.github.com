import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';

import { SiteProps, PageTypes } from './types';

const PagePage = ({ site, post }) => {
  const title = [post.title, site.title].join(' - ');
  const content = { __html: post.content };

  return (
    <div>
      <Helmet title={title} />
      <div className="post">
        <div className="post-header">
          <h1 className="title">
            {post.title}
          </h1>
          <div className="content" dangerouslySetInnerHTML={content} />
        </div>
      </div>
    </div>
  );
};

PagePage.propTypes = {
  site: SiteProps.isRequired,
  post: PageTypes.isRequired,
};

export default PagePage;
