import React from 'react';

const DISCUS_JS = {
  __html: `
    /* * * CONFIGURATION VARIABLES * * */
    var disqus_shortname = 'shuheikagawa';

    /* * * DON'T EDIT BELOW THIS LINE * * */
    (function() {
      var dsq = document.createElement('script'); dsq.type = 'text/javascript'; dsq.async = true;
      dsq.src = '//' + disqus_shortname + '.disqus.com/embed.js';
      (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);
    })();
  `
};

const Comments = () => (
  <div className="comments">
    <div id="disqus_thread" />
    <script dangerouslySetInnerHTML={DISCUS_JS} />
    <noscript>
      Please enable JavaScript to view the
      <a href="https://disqus.com/?ref_noscript" rel="nofollow">comments powered by Disqus.</a>
    </noscript>
  </div>
);

export default Comments;
