const { obj: through } = require("through2");
const cheerio = require("cheerio");

function normalizeUrl(url, hostname) {
  if (!url) {
    return null;
  }
  if (url.startsWith("https://") || url.startsWith("http://")) {
    return url;
  }
  if (url.startsWith("//")) {
    return `https:${url}`;
  }
  if (url.startsWith("/")) {
    return `${hostname}${url}`;
  }
  return `${hostname}/${url}`;
}

function limitText(text, length) {
  if (text.length > length) {
    // TODO: Remove an incomplete word at the end? But don't do it for Japanese.
    return `${text.slice(0, length)}...`;
  }
  return text;
}

function summarize(options) {
  function transform(file, enc, cb) {
    if (file.frontMatter) {
      const html = file.contents.toString();
      const $ = cheerio.load(html);

      // Pick the first image src if exists.
      if (!file.frontMatter.image) {
        const $img = $("img");
        if ($img.length > 0) {
          const src = $img.attr("src");
          const image = normalizeUrl(src, options.hostname);
          if (image) {
            Object.assign(file.frontMatter, { image });
          }
        }
      }

      // Add description.
      if (!file.frontMatter.description) {
        const description = limitText($.text().replace(/\s+/g, " "), 160);
        Object.assign(file.frontMatter, { description });
      }
    }

    this.push(file);
    cb();
  }

  function flush(cb) {
    cb();
  }

  return through(transform, flush);
}

module.exports = summarize;
