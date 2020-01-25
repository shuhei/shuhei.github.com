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

// No XSS protection because the source is in this repository.
function renderAttrs(attrs) {
  return Object.keys(attrs)
    .map(key => (attrs[key] ? `${key}="${attrs[key]}"` : undefined))
    .filter(Boolean)
    .join(" ");
}

class CustomRenderer extends marked.Renderer {
  // - Add `hljs` class to code blocks  https://github.com/chjj/marked/pull/418
  // - Show filename if provided
  // `language` can be a language identifier for highlight.js or a filename with an extension.
  code(code, language) {
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
  }

  // Responsive table
  // https://www.w3schools.com/howto/howto_css_table_responsive.asp
  table(...args) {
    const table = super.table(...args);
    return `<div class="table-wrapper">${table}</div>`;
  }

  image(src, title, alt) {
    if (title) {
      // Parse image size encoded at the end of the title.
      const match = title.match(/\s*=(\d+)x(\d+)$/);
      if (match) {
        const [size, width, height] = match;
        // Remove the image size from the title.
        const newTitle = title.slice(0, -size.length) || undefined;
        const attrs = {
          src,
          alt,
          title: newTitle,
          width,
          height
        };
        return `<img ${renderAttrs(attrs)}>`;
      }
    }
    return super.image(src, title, alt);
  }
}

module.exports = new CustomRenderer();
