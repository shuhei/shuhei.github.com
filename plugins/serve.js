const connect = require("connect");
const serveStatic = require("serve-static");
const http = require("http");
const gutil = require("gulp-util");

// Create and start an HTTP server that serves static files.
function startServer(root) {
  return new Promise((resolve, reject) => {
    const app = connect().use(serveStatic(root));
    const server = http.createServer(app);

    server.listen(4000, err => {
      if (err) {
        reject(err);
        return;
      }
      gutil.log("Listening on port 4000");
      resolve();
    });
  });
}

module.exports = startServer;
