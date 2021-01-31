const markdownIt = require("markdown-it");
const highlightjs = require("highlight.js");

function getMarkdownIt() {
  function highlight(code, language) {
    const extension = (language || "").split(".").pop();
    const isValidLang = !!(extension && highlightjs.getLanguage(extension));
    const highlighted = isValidLang
      ? highlightjs.highlight(extension, code).value
      : md.utils.escapeHtml(code);
    const filename =
      extension && extension !== language
        ? `<div><span class="code__filename">${language}</span></div>`
        : "";
    return `<pre><code class="hljs ${extension}">${filename}${highlighted}</code></pre>`;
  }

  const md = markdownIt({
    highlight
  });

  return md;
}

module.exports = {
  getMarkdownIt
};
