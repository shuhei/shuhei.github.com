const googleAnalytics = `<script>
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

  ga('create', 'UA-309586-8', 'shuheikagawa.com');
  ga('send', 'pageview');
</script>`;

const fontCSS =
  "https://fonts.googleapis.com/css?family=IBM+Plex+Sans:400,700|Fira+Mono:400&display=swap";

// Preload woff2 because all browsers that support preload support woff2.
const fonts = [
  // Fira Mono 400
  "https://fonts.gstatic.com/s/firamono/v8/N0bX2SlFPv1weGeLZDtgJv7Ss9XZYQ.woff2",
  // IBM Plex Sans 400
  "https://fonts.gstatic.com/s/ibmplexsans/v7/zYXgKVElMYYaJe8bpLHnCwDKhdHeFaxOedc.woff2",
  // IBM Plex Sans 700
  "https://fonts.gstatic.com/s/ibmplexsans/v7/zYX9KVElMYYaJe8bpLHnCwDKjWr7AIFsdP3pBms.woff2"
];

function preloadFont(href) {
  // Font preload needs crossorigin.
  return `<link rel="preload" href="${href}" as="font" crossorigin="anonymous">`;
}

const preloads = [
  `<link rel="preload" href="${fontCSS}" as="style">`,
  ...fonts.map(font => preloadFont(font))
].join("\n");

function escapeAttr(str) {
  return str
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function meta(attrName, attrValue, content) {
  if (!content) {
    return null;
  }
  const attr = escapeAttr(attrValue);
  return `<meta ${attrName}="${attr}" content="${escapeAttr(content)}">`;
}

// It's important to have a <script> tag in head. Otherwise Google Analytics
// inserts <script> tag after inline <script>.
function Layout({ site, css, title, image, description, children }) {
  const metaTags = [
    meta("name", "description", description),
    meta("name", "twitter:card", "summary_large_image"),
    meta("name", "twitter:site", "@shuheikagawa"),
    // Open Graph metadata needs `property` instead of `name`.
    meta("property", "og:title", title),
    meta("property", "og:site_name", site.title),
    meta("property", "og:description", description),
    meta("property", "og:image", image)
  ].filter(Boolean);

  return `<!doctype html>
  <html lang="en">
    <head>
      <meta charset="utf-8">
			${preloads}
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>${title}</title>
      <link rel="icons" sizes="16x16 32x32 48x48" href="/favicon.ico">
      <link rel="alternate" type="application/rss+xml" title="RSS Feed for shuheikagawa.com" href="/blog/feed/rss.xml">
      ${googleAnalytics}
      <style>${css}</style>
      <link rel="stylesheet" href="${fontCSS}">
      ${metaTags.join("\n")}
    </head>
    <body>
      <div class="container">
        <header class="header">
          <h1 class="header__title">
            <a href="/">${site.title}</a>
          </h1>
          <nav class="header__nav">
            <ul class="menu">
              <li class="menu__item">
                <a href="/about/">About</a>
              </li>
              <li class="menu__item">
                <a href="/works/">Works</a>
              </li>
              <li class="menu__item">
                <a href="/blog/archives/">Archives</a>
              </li>
            </ul>
          </nav>
        </header>
        <div class="main">
          ${children}
        </div>
        <footer class="footer">
          © ${site.author}
        </footer>
      </div>
    </body>
  </html>`;
}

module.exports = Layout;
