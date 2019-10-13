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

const DEBUG = !!process.env.DEBUG_TITLE_IMAGE;

function getTitleFont(size) {
  return `bold ${size}px 'IBM Plex Sans'`;
}

function getSubtitleFont(size) {
  return `normal ${size}px 'IBM Plex Sans'`;
}

function fitTextIntoRectangle({ ctx, text, maxFontSize, rect }) {
  if (DEBUG) {
    ctx.strokeStyle = "rgba(0, 0, 0, 0.3)";
    ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
  }

  // Try font sizes from a big one until the title fits into the image.
  for (let fontSize = maxFontSize; fontSize > 0; fontSize -= 1) {
    ctx.font = getTitleFont(fontSize);
    let words = text.split(" ");
    let { y } = rect;
    const lines = [];
    while (words.length > 0) {
      let i;
      let size;
      let subtext;
      // Remove words until the rest fit into the width.
      for (i = words.length; i >= 0; i -= 1) {
        subtext = words.slice(0, i).join(" ");
        size = ctx.measureText(subtext);

        if (DEBUG) {
          ctx.strokeStyle = "rgba(0, 0, 0, 0.2)";
          ctx.strokeText(subtext, rect.x, y + size.emHeightAscent);
        }

        if (size.width <= rect.width) {
          break;
        }
      }

      if (i <= 0) {
        // A word doesn't fit into a line. Try a smaller font size.
        break;
      }

      lines.push({
        text: subtext,
        x: rect.x,
        y: y + size.emHeightAscent
      });

      words = words.slice(i);
      y += size.emHeightAscent + size.emHeightDescent;
    }

    const space = rect.y + rect.height - y;
    if (words.length === 0 && space >= 0) {
      // The title fits into the image with the font size.
      // Vertically centering the text in the given rectangle.
      const centeredLines = lines.map(line => {
        return {
          ...line,
          y: line.y + space / 2
        };
      });
      return {
        fontSize,
        lines: centeredLines
      };
    }
  }

  throw new Error(
    `Text layout failed: The given text '${text}' did not fit into the given rectangle ${JSON.stringify(
      rect
    )} even with the smallest font size (1)`
  );
}

function createTitleImage({ title, subtitle }) {
  const width = 680;
  const height = 357;
  const xPadding = 30;
  const paddingTop = 20;
  const paddingBottom = 40;
  const paddingAboveSubtitle = 15;
  const titleFontSize = 50;
  const subtitleFontSize = 18;
  const backgroundColor = "#f7f0e7";
  const blueColor = "#095ae8";
  const darkColor = "#2d1e14";

  return new Promise((resolve, reject) => {
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const { lines, fontSize } = fitTextIntoRectangle({
      ctx,
      text: title,
      maxFontSize: titleFontSize,
      rect: {
        x: xPadding,
        y: paddingTop,
        width: width - xPadding * 2,
        height:
          height -
          paddingTop -
          paddingAboveSubtitle -
          subtitleFontSize -
          paddingBottom
      }
    });

    ctx.fillStyle = blueColor;
    ctx.font = getTitleFont(fontSize);
    lines.forEach(({ text, x, y }) => {
      ctx.fillText(text, x, y);
    });

    ctx.fillStyle = darkColor;
    ctx.font = getSubtitleFont(subtitleFontSize);
    ctx.fillText(subtitle, xPadding, height - paddingBottom);

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
