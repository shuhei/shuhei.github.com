const Layout = ({ site, children }) => (`
  <div>
    <header class="header">
      <h1 class="header__title">
        <a href="/">${site.title}</a>
      </h1>
      <nav>
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
`);

module.exports = Layout;
