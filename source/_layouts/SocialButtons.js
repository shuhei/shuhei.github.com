import React, { PropTypes } from 'react';

const TWITTER_JS = {
  __html: `
    !function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'twitter-wjs');
  `
};

const SocialButtons = ({ title }) => {
  return (
    <div className="social-buttons">
      <a
        className="twitter-share-button"
        href="https://twitter.com/share"
        dataVia="shuheikagawa"
        dataText={title}
      >
        Tweet
      </a>
      <script dangerouslySetInnerHTML={TWITTER_JS} />
    </div>
  );
};

SocialButtons.propTypes = {
  title: PropTypes.string.isRequired,
};

export default SocialButtons;
