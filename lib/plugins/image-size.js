const util = require("util");
const path = require("path");
const { promises: fs } = require("fs");
const sizeOf = util.promisify(require("image-size").imageSize);

async function readImageSizes(dir) {
  const files = (await fs.readdir(dir)).filter(f => !f.startsWith("."));
  const promises = files.map(async file => {
    const filePath = path.resolve(dir, file);
    const dimensions = await sizeOf(filePath);
    return [file, dimensions];
  });
  const entries = await Promise.all(promises);
  return new Map(entries);
}

module.exports = readImageSizes;
