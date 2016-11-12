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

const appRoutes = [
  {
    pattern: '/',
    component: IndexPage,
    props(state, json) {
      return { ...state, posts: json };
    },
  },
  {
    pattern: '/blog/pages/\\d+/',
    component: IndexPage,
    props(state, json) {
      return { ...state, posts: json };
    },
  },
  {
    pattern: '/blog/archives/',
    component: ArchivesPage,
    props(state, json) {
      return { ...state, posts: json };
    },
  },
  {
    pattern: '/blog/\\d+/\\d+/\\d+/.*/',
    component: PostPage,
    props(state, json) {
      return { ...state, post: json };
    },
  },
  {
    pattern: '/.*',
    component: PagePage,
    props(state, json) {
      return { ...state, post: json };
    },
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
