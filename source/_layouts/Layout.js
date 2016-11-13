import React, { PropTypes } from 'react';
import Helmet from 'react-helmet';

import { handleLink } from '../_js/link';
import { SiteProps } from './types';

const Layout = ({ site, children }) => (
  <div>
    <Helmet
      meta={[
        { charset: 'utf-8' },
        { name: 'viewport', content: 'initial-scale=1' },
      ]}
      link={[
        { rel: 'icons', sizes: '16x16 32x32 48x48', href: '/favicon.ico' },
        { rel: 'alternate', type: 'application/rss+xml', title: 'RSS Feed for shuheikagawa.com', href: '/blog/feed/rss.xml' },
        { rel: 'stylesheet', href: 'http://fonts.googleapis.com/css?family=Asap:4000,700' },
        { rel: 'stylesheet', href: '/css/style.css' },
      ]}
    />
    <header className="header">
      <h1 className="header__title">
        <a href="/" onClick={handleLink}>{site.title}</a>
      </h1>
      <nav>
        <ul className="menu">
          <li className="menu__item">
            <a href="/about/" onClick={handleLink}>About</a>
          </li>
          <li className="menu__item">
            <a href="/works/" onClick={handleLink}>Works</a>
          </li>
          <li className="menu__item">
            <a href="/blog/archives/" onClick={handleLink}>Archives</a>
          </li>
        </ul>
      </nav>
    </header>
    <div className="main">
      {children}
    </div>
    <footer className="footer">
      © {site.author}
    </footer>
  </div>
);

Layout.propTypes = {
  site: SiteProps.isRequired,
  children: PropTypes.node.isRequired,
};

export default Layout;
