const { marked } = require("gulp-markdown");
const highlightjs = require("highlight.js");

const escapeMap = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
};

function escapeForHTML(input) {
  return input.replace(/([&<>'"])/g, char => escapeMap[char]);
}

const renderer = new marked.Renderer();

// - Add `hljs` class to code blocks  https://github.com/chjj/marked/pull/418
// - Show filename if provided
// `language` can be a language identifier for highlight.js or a filename with an extension.
renderer.code = (code, language) => {
  const extension = (language || "").split(".").pop();
  const isValidLang = !!(extension && highlightjs.getLanguage(extension));
  const highlighted = isValidLang
    ? highlightjs.highlight(extension, code).value
    : escapeForHTML(code);
  const filename =
    extension && extension !== language
      ? `<div><span class="code__filename">${language}</span></div>`
      : "";
  return `<pre><code class="hljs ${extension}">${filename}${highlighted}</code></pre>`;
};

// Responsive table
// https://www.w3schools.com/howto/howto_css_table_responsive.asp
renderer.table = (header, body) => {
  const table = marked.Renderer.prototype.table.call(this, header, body);
  return `<div class="table-wrapper">${table}</div>`;
};

module.exports = renderer;
