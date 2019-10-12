const path = require("path");
const { createCanvas, registerFont } = require("canvas");
const fs = require("fs").promises;

const sansDir = "./node_modules/@ibm/plex/IBM-Plex-Sans/fonts/complete/otf/";

registerFont(path.resolve(sansDir, "IBMPlexSans-Bold.otf"), {
  family: "IBM Plex Sans",
  weight: "bold"
});
registerFont(path.resolve(sansDir, "IBMPlexSans-Regular.otf"), {
  family: "IBM Plex Sans",
  weight: "normal"
});

function getTitleFont(size) {
  return `bold ${size}px 'IBM Plex Sans'`;
}

function getSiteNameFont(size) {
  return `normal ${size}px 'IBM Plex Sans'`;
}

function createSummaryImage(title) {
  const width = 600;
  const height = 300;
  const padding = 20;
  const titleFontSize = 50;
  const siteNameFontSize = 18;
  const backgroundColor = "#f7f0e7";
  const blueColor = "#095ae8";
  const darkColor = "#2d1e14";

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = blueColor;
  ctx.font = getTitleFont(titleFontSize);

  for (let fontSize = titleFontSize; fontSize > 0; fontSize -= 1) {
    ctx.font = getTitleFont(fontSize);
    let words = title.split(" ");
    let y = padding;
    const lines = [];
    while (words.length > 0) {
      let i;
      let size;
      let text;
      for (i = words.length; i >= 0; i -= 1) {
        text = words.slice(0, i).join(" ");
        size = ctx.measureText(text);
        if (size.width <= width - padding * 2) {
          break;
        }
      }

      if (i === 0) {
        // A word doesn't fit into a line. Try a smaller font size.
        break;
      }

      lines.push({
        text,
        yPosition: y + size.emHeightAscent
      });

      words = words.slice(i);
      y += size.emHeightAscent + size.emHeightDescent;
    }

    const space = height - padding * 2.5 - siteNameFontSize - y;
    if (words.length === 0 && space >= 0) {
      lines.forEach(({ text, yPosition }) => {
        ctx.fillText(text, padding, yPosition + space / 2);
      });
      break;
    }
  }

  ctx.fillStyle = darkColor;
  ctx.font = getSiteNameFont(siteNameFontSize);
  ctx.fillText("shuheikagawa.com", padding, height - padding);

  return new Promise((resolve, reject) => {
    canvas.toBuffer((err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    }, "image/png");
  });
}

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
  "Amazon.co.jp の洋書レビューを Amazon.com で見るための Greasemonkey"
];
titles.forEach(async title => {
  fs.writeFile(
    `images/${title.replace(/[^a-zA-Z0-9]/g, "_")}.png`,
    await createSummaryImage(title)
  );
});
