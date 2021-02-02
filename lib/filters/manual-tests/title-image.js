/* eslint-disable no-console */
const fs = require("fs").promises;
const path = require("path");
const { titleImage } = require("../title-image");

// Test various titles quickly
const titles = [
  "Migrating from bash to zsh",
  "Writing an Interpreter and a Compiler in Rust",
  "DNS Polling for Reliability",
  "Check Your server.keepAliveTimeout",
  "2018 in Review",
  "Histogram for Time-Series Metrics on Node.js",
  "Node.js under a Microscope: CPU FlameGraph and FlameScope",
  "iPhone Provisioning Profile",
  "Wordpress の Textile プラグイン",
  "最近買った本 2009年7月",
  "iPhone で OpenFrameworks",
  "OpenGL のブレンディング方法について",
  "const とポインタ",
  "基本クラスのメンバを初期化できない",
  "Amazon.co.jp の洋書レビューを Amazon.com で見るための Greasemonkey",
  "日本語は単語がスペースで分かれていないので一単語になってしまう"
];

async function generateImages() {
  // Create a directory to save images in.
  const imagesDir = path.join(__dirname, "images");
  try {
    await fs.mkdir(imagesDir);
  } catch (err) {
    // It's fine if the directory already exists.
    if (err.code !== "EEXIST") {
      throw err;
    }
  }

  // Generate and write images in parallel.
  const promises = titles.map(async title => {
    const image = await titleImage(title, "shuheikagawa.com");
    const outputPath = path.join(
      imagesDir,
      `${title.replace(/[^a-zA-Z0-9]/g, "_")}.png`
    );
    await fs.writeFile(outputPath, image);
    return outputPath;
  });

  return Promise.all(promises);
}

// Wait for the results.
generateImages()
  .then(outputs => {
    console.log("Done:");
    outputs.forEach(outputPath => {
      const relativePath = path.relative(process.cwd(), outputPath);
      console.log(`  ${relativePath}`);
    });
  })
  .catch(err => console.log("Failed to saves images", err));
