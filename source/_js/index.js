import React from 'react';
import { render } from 'react-dom';

import Router from './Router';
import IndexPage from '../_layouts/IndexPage';
import ArchivesPage from '../_layouts/ArchivesPage';
import PagePage from '../_layouts/PagePage';
import PostPage from '../_layouts/PostPage';
import Layout from '../_layouts/Layout';

const container = document.getElementById('container');

// eslint-disable-next-line no-underscore-dangle
const preloadedProps = window.__PRELOADED_PROPS__;
window.history.replaceState(preloadedProps, '', location.pathname);

const appRoutes = [
  {
    pattern: '/',
    component: IndexPage,
  },
  {
    pattern: '/blog/pages/\\d+/',
    component: IndexPage,
  },
  {
    pattern: '/blog/archives/',
    component: ArchivesPage,
  },
  {
    pattern: '/blog/\\d+/\\d+/\\d+/.*/',
    component: PostPage,
  },
  {
    pattern: '/.*',
    component: PagePage,
  },
];

render(
  <Router
    initialProps={preloadedProps}
    routes={appRoutes}
    wrapperComponent={Layout}
  />,
  container
);
