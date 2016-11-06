import React, { PropTypes } from 'react';
import Helmet from 'react-helmet';

import { handleLink } from '../_js/link';
import { SiteProps } from './types';

const GOOGLE_ANALYTICS_JS = {
  __html: `
    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
    })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

    ga('create', 'UA-309586-8', 'shuheikagawa.com');
    ga('send', 'pageview');
  `,
};

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
      script={[
        { src: '/js/index.js' },
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
      <script dangerouslySetInnerHTML={GOOGLE_ANALYTICS_JS} />
    </footer>
  </div>
);

Layout.propTypes = {
  site: SiteProps.isRequired,
  children: PropTypes.node.isRequired,
};

export default Layout;
