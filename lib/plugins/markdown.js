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

function getMarkdownIt() {
  return markdownIt({
    html: true,
    linkify: true,
    highlight
  });
}

module.exports = {
  getMarkdownIt,
  highlight
};
