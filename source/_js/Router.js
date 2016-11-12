import React, { Component, PropTypes } from 'react';

import { addListener } from './link';
import Layout from '../_layouts/Layout';
import { RouteProps } from '../_layouts/types';

export default class Router extends Component {
  constructor(props) {
    super(props);


    const initialRoute = this.findRoute(location.pathname);
    this.state = {
      component: initialRoute.component,
      props: props.initialProps,
    };

    this.updateRoute = this.updateRoute.bind(this);
  }

  componentDidMount() {
    addListener(this.updateRoute);
  }

  findRoute(path) {
    const normalizedPath = path.replace(/\/index\.html$/, '/');
    return this.props.routes.find(route =>
      new RegExp(`^${route.pattern}$`).test(normalizedPath)
    );
  }

  updateRoute(path) {
    const route = this.findRoute(path);
    if (!route) {
      // TODO: Handle not found.
      console.warn(`Route not found for ${path}`);
      return;
    }
    fetch(`${path}index.json`)
      .then(res => res.json())
      .then(json => route.props(this.state.props, json))
      .then((nextProps) => {
        // TODO: Update history.
        // window.history.pushState(nextProps, '', path);
        this.setState({
          component: route.component,
          props: nextProps,
        });
        window.scrollTo(0, 0);
      });
  }

  render() {
    return (
      <Layout {...this.state.props}>
        {React.createElement(
          this.state.component,
          this.state.props,
          null
        )}
      </Layout>
    );
  }
}

Router.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  initialProps: PropTypes.object.isRequired,
  routes: PropTypes.arrayOf(RouteProps).isRequired,
};
