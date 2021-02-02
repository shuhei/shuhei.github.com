const DEBUG = (process.env.DEBUG || "").includes("wbr");

// Insert <wbr> tags between words in each camelCase word
// to let browsers break long words.
function insertWbr(str) {
  const inserted = str.replace(/[^\s]+/g, chunk => {
    // Leave short words.
    if (chunk.length < 12) {
      return chunk;
    }
    // Didits appear in the patterns asynmetrically
    // to treat continuous digits as a word in camelCase.
    return (
      chunk
        // e.g abc.Def -> abc<wbr>.Def
        .replace(/([a-zA-Z])([^-a-zA-Z])/g, "$1<wbr>$2")
        // For camelCase
        .replace(/([a-z0-9])([A-Z])/g, "$1<wbr>$2")
    );
  });
  if (DEBUG && inserted !== str) {
    console.error(`<wbr> "${str}" -> "${inserted}"`);
  }
  return inserted;
}

module.exports = {
  insertWbr
};
