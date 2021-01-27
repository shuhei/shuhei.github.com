const googleAnalytics = `<script>
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

  ga('create', 'UA-309586-8', 'shuheikagawa.com');
  ga('send', 'pageview');
</script>`;

const fontFamilies = [
  "Libre+Baskerville:ital@0;1",
  "Libre+Franklin:wght@700",
  "DM+Mono"
];
const fontCSS =
  "https://fonts.googleapis.com/css2?display=swap" +
  fontFamilies.map(f => `&family=${f}`).join("");

// Preload woff2 because all browsers that support preload support woff2.
const fontFiles = [
  // Libre Baskerville
  "https://fonts.gstatic.com/s/librebaskerville/v9/kmKnZrc3Hgbbcjq75U4uslyuy4kn0qNZaxMaC82U.woff2",
  // Libre Franklin
  "https://fonts.gstatic.com/s/librefranklin/v6/jizOREVItHgc8qDIbSTKq4XkRg8T88bjFuXOnduhycKkANDPTedX18mE.woff",
  // DM Mono
  "https://fonts.gstatic.com/s/dmmono/v3/aFTU7PB1QTsUX8KYthqQBK6PYK0.woff2"
];

function preloadFont(href) {
  // Font preload needs crossorigin.
  return `<link rel="preload" href="${href}" as="font" crossorigin="anonymous">`;
}

const preloads = [
  `<link rel="preload" href="${fontCSS}" as="style">`,
  ...fontFiles.map(font => preloadFont(font))
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
                <a href="/blog/archives/">All posts</a>
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
