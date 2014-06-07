var connect = require('connect');
var http = require('http');

module.exports = function(root) {
  var app = connect().use(connect.static(root));
  return http.createServer(app);
};
