import React, { Component, PropTypes } from 'react';

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
        this.page.url = location.href;
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

export default class Router extends Component {
  constructor(props) {
    super(props);


    const initialRoute = this.findRoute(location.pathname);
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
      this.popState(location.pathname, event.state);
    });
  }

  findRoute(path) {
    const normalizedPath = path.replace(/\/index\.html$/, '/');
    return this.props.routes.find(route =>
      new RegExp(`^${route.pattern}$`).test(normalizedPath)
    );
  }

  pushState(path) {
    window.ga('set', 'page', path);
    window.ga('send', 'pageview');

    const route = this.findRoute(path);
    if (!route) {
      // TODO: Handle not found.
      console.warn(`Route not found for ${path}`);
      return;
    }
    fetch(`${path}index.json`)
      .then(res => res.json())
      .then((nextProps) => {
        this.setState({
          component: route.component,
          props: nextProps,
        });
        window.scrollTo(0, 0);
        window.history.pushState(nextProps, '', path);

        resetSpeakerDeck();
        resetDisqus();
      });
  }

  popState(path, previousState) {
    window.ga('set', 'page', path);
    window.ga('send', 'pageview');

    const route = this.findRoute(path);
    if (!route) {
      // TODO: Handle not found.
      console.warn(`Route not found for ${path}`);
      return;
    }
    this.setState({
      component: route.component,
      props: previousState,
    });
    window.scrollTo(0, 0);

    // Don't need to trigger SpeakerDeck because its script listens to `popstate` by itself.
    resetDisqus();
  }

  render() {
    return React.createElement(
      this.props.wrapperComponent,
      this.state.props,
      React.createElement(
        this.state.component,
        this.state.props,
        null
      )
    );
  }
}

Router.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  initialProps: PropTypes.object.isRequired,
  routes: PropTypes.arrayOf(RouteProps).isRequired,
  wrapperComponent: PropTypes.func.isRequired,
};
