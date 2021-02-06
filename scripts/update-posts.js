// This script is for updating post .md files at once.

const fs = require("fs").promises;
const path = require("path");

(async () => {
  const dir = "source/posts";
  const files = await fs.readdir(dir);

  for (const file of files) {
    if (!file.endsWith(".md")) {
      continue;
    }

    const filePath = path.join(dir, file);
    const content = await fs.readFile(filePath, "utf8");
    const replaced = content
      // Remove time from the date.
      .replace(/date: (\d{4}-\d{2}-\d{2}) \d{2}:\d{2}/, "date: $1")
      // Rename categories as tags
      .replace(/categories: /, "tags: ")
      // Remove unused frontmatter fileds.
      .replace(/comments: \w+\n/, "")
      .replace(/published: \w+\n/, "")
      .replace(/tags: \n/, "")
      .replace(/tags:\n/, "")
      // Rely on the date in the filename.
      .replace(/date: [0-9-]+\n/, "")
      // This should be set at a central place.
      .replace(/layout: post\n/, "");

    await fs.writeFile(filePath, replaced);
  }
})();
