const path = require("path");

/**
 * Create a permalink for a post page.
 * 2020-11-30-oh-hi.md -> blog/2020/11/30/oh-hi/index.html
 */
function blogPermalink(page) {
  const { name } = path.parse(page.inputPath);
  const [y, m, d, ...rest] = name.split("-");
  const slug = rest.join("-");
  if (slug !== page.fileSlug) {
    throw new Error(`Unexpected file slug: ${page.fileSlug} vs ${slug}`);
  }
  return `blog/${y}/${m}/${d}/${slug}/index.html`;
}

/*
 * Create a permalink for an index page.
 *
 * - The first page: index.html (the top page)
 * - The second page and later: blog/pages/2/index.html, blog/pages/3/index.html,
 *   and so on
 */
function indexPermalink(pagination) {
  const page = pagination.pageNumber;
  if (page === 0) {
    return "index.html";
  }
  // pagination.pageNumber is zero-indexed.
  return `blog/pages/${page + 1}/index.html`;
}

module.exports = {
  blogPermalink,
  indexPermalink
};
