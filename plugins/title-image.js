const path = require("path");
const { createCanvas, registerFont } = require("canvas");

const sansDir = path.resolve(
  __dirname,
  "../node_modules/@ibm/plex/IBM-Plex-Sans/fonts/complete/otf"
);

registerFont(path.join(sansDir, "IBMPlexSans-Bold.otf"), {
  family: "IBM Plex Sans",
  weight: "bold"
});
registerFont(path.join(sansDir, "IBMPlexSans-Regular.otf"), {
  family: "IBM Plex Sans",
  weight: "normal"
});

function getTitleFont(size) {
  return `bold ${size}px 'IBM Plex Sans'`;
}

function getSubtitleFont(size) {
  return `normal ${size}px 'IBM Plex Sans'`;
}

function createTitleImage({ title, subtitle }) {
  const width = 600;
  const height = 300;
  const padding = 20;
  const titleFontSize = 50;
  const subtitleFontSize = 18;
  const backgroundColor = "#f7f0e7";
  const blueColor = "#095ae8";
  const darkColor = "#2d1e14";

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = blueColor;
  ctx.font = getTitleFont(titleFontSize);

  // Try font sizes from a big one until the title fits into the image.
  for (let fontSize = titleFontSize; fontSize > 0; fontSize -= 1) {
    ctx.font = getTitleFont(fontSize);
    let words = title.split(" ");
    let y = padding;
    const lines = [];
    while (words.length > 0) {
      let i;
      let size;
      let text;
      // Pick words that fit into the width.
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

    const space = height - padding * 2.5 - subtitleFontSize - y;
    if (words.length === 0 && space >= 0) {
      // The title fits into the image with the font size.
      // Let's draw the title.
      lines.forEach(({ text, yPosition }) => {
        // `space / 2` is for vertically centering the title.
        ctx.fillText(text, padding, yPosition + space / 2);
      });
      break;
    }
  }

  ctx.fillStyle = darkColor;
  ctx.font = getSubtitleFont(subtitleFontSize);
  ctx.fillText(subtitle, padding, height - padding);

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

module.exports = createTitleImage;
