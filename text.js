const fs = require("fs").promises;
const createSummaryImage = require("./plugins/title-image");

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
    await createSummaryImage({ title, subtitle: "@shuheikagawa" })
  );
});
