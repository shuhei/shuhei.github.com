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

module.exports = {
  normalizeUrl
};
