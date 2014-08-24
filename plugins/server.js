var connect = require('connect');
var serveStatic = require('serve-static');
var http = require('http');

module.exports = function(root) {
  var app = connect().use(serveStatic(root));
  return http.createServer(app);
};
