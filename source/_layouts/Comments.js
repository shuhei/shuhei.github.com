const Comments = () => (`
  <div class="comments">
    <div id="disqus_thread" />
    <script>
      (function () {
        var d = document, s = d.createElement('script');
        s.src = 'https://shuheikagawa.disqus.com/embed.js';
        s.setAttribute('data-timestamp', +new Date());
        (d.head || d.body).appendChild(s);
      })();
    </script>
    <noscript>
      Please enable JavaScript to view the
      <a href="https://disqus.com/?ref_noscript" rel="nofollow">comments powered by Disqus.</a>
    </noscript>
  </div>
`);

module.exports = Comments;