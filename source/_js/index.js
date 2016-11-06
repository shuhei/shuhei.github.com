import React from 'react';
import { render } from 'react-dom';

import { addListener } from './link';
import Layout from '../_layouts/Layout';
import IndexPage from '../_layouts/IndexPage';
import ArchivesPage from '../_layouts/ArchivesPage';
import PagePage from '../_layouts/PagePage';
import PostPage from '../_layouts/PostPage';

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

function findRoute(routes, path) {
  const normalizedPath = path.replace(/\/index\.html$/, '/');
  return routes.find(route =>
    new RegExp(`^${route.pattern}$`).test(normalizedPath)
  );
}

function renderPage(component, props) {
  render(
    React.createElement(
      Layout,
      props,
      React.createElement(component, props),
    ),
    container
  );
}

const initialRoute = findRoute(appRoutes, location.pathname);
renderPage(initialRoute.component, preloadedProps);

let currentProps = preloadedProps;
const updateRoute = (path) => {
  const route = findRoute(appRoutes, path);
  if (!route) {
    // TODO: Handle not found.
    console.warn(`Route not found for ${path}`);
    return;
  }
  fetch(`${path}index.json`)
    .then(res => res.json())
    .then(json => route.props(currentProps, json))
    .then((nextProps) => {
      currentProps = nextProps;
      renderPage(route.component, currentProps);
      window.scrollTo(0, 0);
      window.history.pushState(currentProps, '', path);
    });
};
addListener(updateRoute);
