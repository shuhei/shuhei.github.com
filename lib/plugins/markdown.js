const markdownIt = require("markdown-it");
const { escapeHtml } = require("markdown-it/lib/common/utils");
const highlightjs = require("highlight.js");

function highlight(code, language) {
  const extension = (language || "").split(".").pop();
  const isValidLang = !!(extension && highlightjs.getLanguage(extension));
  const highlighted = isValidLang
    ? highlightjs.highlight(extension, code).value
    : escapeHtml(code);
  const filename =
    extension && extension !== language
      ? `<div><span class="code__filename">${language}</span></div>`
      : "";
  return `<pre><code class="hljs ${extension}">${filename}${highlighted}</code></pre>`;
}

/**
 * A markdown-it plugin to wrap a table for responsive table.
 * https://www.w3schools.com/howto/howto_css_table_responsive.asp
 */
function tableWrapperPlugin(md) {
  md.renderer.rules.table_open = () => '<div class="table-wrapper"><table>';
  md.renderer.rules.table_close = () => "</table></div>";
}

function imageWrapperPlugin(md) {
  const defaultRenderer = md.renderer.rules.image;
  md.renderer.rules.image = (...args) => {
    return '<span class="img-wrapper">' + defaultRenderer(...args) + "</span>";
  };
}

function getMarkdownIt() {
  return markdownIt({
    html: true,
    linkify: false,
    highlight
  })
    .use(tableWrapperPlugin)
    .use(imageWrapperPlugin);
}

module.exports = {
  getMarkdownIt,
  highlight
};
