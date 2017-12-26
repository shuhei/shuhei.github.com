import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { addListener } from './link';
import { RouteProps } from '../_layouts/types';

const loadScript = (src) => {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.async = true;
  script.src = src;
  (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(script);
};

const resetDisqus = () => {
  const marker = document.getElementById('disqus_thread');
  if (!marker) {
    return;
  }
  if (window.DISQUS) {
    window.DISQUS.reset({
      reload: true,
      config() {
        this.page.url = window.location.href;
      },
    });
  } else {
    // Load Disqus script.
    window.disqus_shortname = 'shuheikagawa';
    loadScript(`//${window.disqus_shortname}.disqus.com/embed.js`);
  }
};

const resetSpeakerDeck = () => {
  const embeds = document.getElementsByClassName('speakerdeck-embed');
  if (embeds.length === 0) {
    return;
  }
  if (window.SpeakerDeck) {
    window.SpeakerDeck.Embed.init();
  } else {
    loadScript('//speakerdeck.com/assets/embed.js');
  }
};

const saveScrollPosition = () => {
  const newState = Object.assign({}, window.history.state, {
    scrollPosition: window.scrollY,
  });
  window.history.replaceState(newState, '', window.location.pathname);
};

export default class Router extends Component {
  constructor(props) {
    super(props);

    const initialRoute = this.findRoute(window.location.pathname);
    this.state = {
      component: initialRoute.component,
      props: props.initialProps,
    };

    this.pushState = this.pushState.bind(this);
  }

  componentDidMount() {
    addListener(this.pushState);
    resetSpeakerDeck();
    resetDisqus();

    window.addEventListener('popstate', (event) => {
      this.popState(window.location.pathname, event.state);
    });

    window.history.replaceState({
      props: this.state.props,
      scrollPosition: 0,
    }, '', window.location.pathname);
  }

  findRoute(path) {
    const normalizedPath = path.replace(/\/index\.html$/, '/');
    return this.props.routes
      .find(route => new RegExp(`^${route.pattern}$`).test(normalizedPath));
  }

  // Handle clicks on internal links.
  pushState(path) {
    window.ga('set', 'page', path);
    window.ga('send', 'pageview');

    const route = this.findRoute(path);
    if (!route) {
      console.warn(`Route not found for ${path}`);
      window.location.href = path;
      return;
    }
    fetch(`${path}index.json`)
      .then(res => res.json())
      .then((nextProps) => {
        // Save scroll position for "Go Back".
        saveScrollPosition();

        this.setState({
          component: route.component,
          props: nextProps,
        }, () => {
          window.scrollTo(0, 0);
          window.history.pushState({
            props: nextProps,
            scrollPosition: 0,
          }, '', path);

          resetSpeakerDeck();
          resetDisqus();
        });
      })
      .catch((e) => {
        console.error('Error navigating to', path, e);
        window.location.href = path;
      });
  }

  // Handle "Go Back" and "Go Forward".
  popState(path, previousState) {
    window.ga('set', 'page', path);
    window.ga('send', 'pageview');

    const route = this.findRoute(path);
    if (!route) {
      console.warn(`Route not found for ${path}`);
      window.location.href = path;
      return;
    }

    this.setState({
      component: route.component,
      props: previousState.props,
    }, () => {
      // Restore scroll position. Not sure why, but this doesn't work without a delay.
      setTimeout(() => {
        window.scrollTo(0, previousState.scrollPosition || 0);
      }, 0);

      resetSpeakerDeck();
      resetDisqus();
    });
  }

  render() {
    return React.createElement(
      this.props.wrapperComponent,
      this.state.props,
      React.createElement(
        this.state.component,
        this.state.props,
        null,
      ),
    );
  }
}

Router.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  initialProps: PropTypes.object.isRequired,
  routes: PropTypes.arrayOf(RouteProps).isRequired,
  wrapperComponent: PropTypes.func.isRequired,
};
