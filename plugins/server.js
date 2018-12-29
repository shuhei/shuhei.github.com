const connect = require('connect');
const serveStatic = require('serve-static');
const http = require('http');

function server(root) {
  const app = connect().use(serveStatic(root));
  return http.createServer(app);
}

module.exports = server;