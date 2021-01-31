const path = require("path");
const { parse: parseUrl } = require("url");
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

async function summarize(page, options) {
  const html = page.templateContent;
  const $ = cheerio.load(html);

  // Pick the first image src if exists.
  const $img = $("img");
  if ($img.length > 0) {
    const src = $img.attr("src");
    // TODO: Check the image dimension.
    const image = normalizeUrl(src, options.hostname);
    if (image) {
      Object.assign(page.frontMatter, { image });
    }
  } else {
    const subtitle = parseUrl(options.hostname).hostname;
    try {
      const buffer = await createTitleImage({
        title: page.frontMatter.title,
        subtitle
      });
      const imagePath = path.join(path.dirname(page.path), "title.png");
      const imageFile = new Vinyl({
        cwd: page.cwd,
        base: page.base,
        path: imagePath,
        contents: buffer
      });
      const imageUrl = normalizeUrl(
        path.join("/", options.blogDir, imageFile.relative),
        options.hostname
      );
      // eslint-disable-next-line no-param-reassign
      page.frontMatter.image = imageUrl;
      this.push(imageFile);
    } catch (e) {
      cb(e);
      return;
    }
  }

  // Add description.
  if (!page.frontMatter.description) {
    const description = limitText($.text().replace(/\s+/g, " "), 160);
    Object.assign(page.frontMatter, { description });
  }
}

module.exports = summarize;
