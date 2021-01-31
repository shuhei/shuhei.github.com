const path = require("path");

function blogPermalink(page) {
  const { name } = path.parse(page.inputPath);
  const [y, m, d, ...rest] = name.split("-");
  const slug = rest.join("-");
  if (slug !== page.fileSlug) {
    throw new Error(`Unexpected file slug: ${page.fileSlug} vs ${slug}`);
  }
  return `/${y}/${m}/${d}/${slug}/index.html`;
}

module.exports = {
  blogPermalink
};
