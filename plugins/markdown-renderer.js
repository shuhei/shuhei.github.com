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

/**
 * Render attrs that have truthy values.
 *
 * No XSS protection because the source is in this repository.
 */
function renderAttrs(attrs) {
  return Object.keys(attrs)
    .map(key => (attrs[key] ? `${key}="${attrs[key]}"` : undefined))
    .filter(Boolean)
    .join(" ");
}

// A custom renderer that renders HTML from Markdown.
class CustomRenderer extends marked.Renderer {
  constructor({ localImagePrefix } = {}) {
    super();
    this.localImagePrefix = localImagePrefix;
  }

  /**
   * @override
   * Add syntax highlighting.
   * - Add `hljs` class to code blocks  https://github.com/chjj/marked/pull/418
   * - Show filename if provided
   * `language` can be a language identifier for highlight.js or a filename with an extension.
   */
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

  /**
   * @override
   * Wrap a table for responsive table.
   * https://www.w3schools.com/howto/howto_css_table_responsive.asp
   */
  table(...args) {
    const table = super.table(...args);
    return `<div class="table-wrapper">${table}</div>`;
  }

  /**
   * @override
   */
  image(...args) {
    const { src, title, alt, width, height } = this.getImageAttrs(...args);

    // If size is available, make the image responsive:
    // - Shrink when the container is narrower than the image
    // - Don't over-stretch the image to fit with the container when the container is wider than the
    //   image
    if (width && height) {
      const aspectRatio = (height / width) * 100;
      // Using `<span>` tags instead of `<div>` and making them block with CSS because `<p>` can't
      // contain block elements.
      return (
        // A wrapper to add negative margin to fit into the screen width on mobile.
        `<span class="responsive-image-wrapper">` +
        // Another wrapper to limit the width to the image width when the container is wider than the
        // image. This can't be merged with the inner wrapper because `padding-top` percentage is
        // relative to the width of the containing block.
        `<span class="responsive-image-outer" style="max-width: ${width}px;">` +
        // `padding-top` to reserve a space with the aspect ratio.
        `<span class="responsive-image-inner" style="padding-top: ${aspectRatio}%;">` +
        `<img class="responsive-image" ${renderAttrs({ src, alt, title })}>` +
        "</span>" +
        "</span>" +
        "</span>"
      );
    }

    return super.image(src, title, alt);
  }

  getImageAttrs(src, title, alt) {
    const baseAttrs = { src, title, alt };

    // Check image size encoded at the end of the title.
    if (title) {
      const match = title.match(/\s*=(\d+)x(\d+)$/);
      if (match) {
        const [size, width, height] = match;
        // Remove the image size from the title.
        const newTitle = title.slice(0, -size.length) || undefined;
        return {
          ...baseAttrs,
          title: newTitle,
          width,
          height
        };
      }
    }

    // Get local image size.
    if (src.startsWith(this.localImagePrefix)) {
      if (this.imageSizes) {
        const srcFile = src.slice(this.localImagePrefix.length);
        const dimensions = this.imageSizes.get(srcFile);
        if (dimensions) {
          const { width, height } = dimensions;
          return {
            ...baseAttrs,
            width,
            height
          };
        }
      }
    }

    return baseAttrs;
  }

  /**
   * Inject image sizes Map into the renderer.
   *
   * Renderer needs sizes of local images for image placeholder feature.
   * Because each marked renderer method needs to be synchronous and image size
   * retrieval requires asynchronous file IO, image size should be retrieved
   * outside and provided to this renderer.
   */
  setImageSizes(imageSizes) {
    this.imageSizes = imageSizes;
  }
}

module.exports = CustomRenderer;
