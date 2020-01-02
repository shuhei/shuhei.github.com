const path = require("path");
const { parse: parseUrl } = require("url");
const { obj: through } = require("through2");
const Vinyl = require("vinyl");
const cheerio = require("cheerio");
const createTitleImage = require("./title-image");

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
  async function transform(file, enc, cb) {
    if (file.frontMatter) {
      const html = file.contents.toString();
      const $ = cheerio.load(html);

      // Pick the first image src if exists.
      if (file.frontMatter.image && file.frontMatter.image !== "auto") {
        // eslint-disable-next-line no-param-reassign
        file.frontMatter.image = normalizeUrl(
          file.frontMatter.image,
          options.hostname
        );
      } else {
        const $img = $("img");
        if ($img.length > 0 && file.frontMatter.image !== "auto") {
          const src = $img.attr("src");
          // TODO: Check the image dimension.
          const image = normalizeUrl(src, options.hostname);
          if (image) {
            Object.assign(file.frontMatter, { image });
          }
        } else {
          const subtitle = parseUrl(options.hostname).hostname;
          try {
            const buffer = await createTitleImage({
              title: file.frontMatter.title,
              subtitle
            });
            const imagePath = path.join(path.dirname(file.path), "title.png");
            const imageFile = new Vinyl({
              cwd: file.cwd,
              base: file.base,
              path: imagePath,
              contents: buffer
            });
            const imageUrl = normalizeUrl(
              path.join("/", options.blogDir, imageFile.relative),
              options.hostname
            );
            // eslint-disable-next-line no-param-reassign
            file.frontMatter.image = imageUrl;
            this.push(imageFile);
          } catch (e) {
            cb(e);
            return;
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