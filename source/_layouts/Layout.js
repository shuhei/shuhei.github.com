import React, { PropTypes } from 'react';

import { handleLink } from '../_js/link';
import { SiteProps } from './types';

const Layout = ({ site, children }) => (
  <div>
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
