import React from 'react';

import Layout from './Layout';
import { SiteProps, PageTypes } from './types';

const PagePage = ({ site, post }) => {
  const title = [post.title, site.title].join(' - ');
  const content = { __html: post.content };

  return (
    <Layout site={site} title={title}>
      <div className="post">
        <div className="post-header">
          <h1 className="title">
            {post.title}
          </h1>
          <div className="content" dangerouslySetInnerHTML={content} />
        </div>
      </div>
    </Layout>
  );
};

PagePage.propTypes = {
  site: SiteProps.isRequired,
  post: PageTypes.isRequired,
};

export default PagePage;
