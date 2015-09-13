import connect from 'connect';
import serveStatic from 'serve-static';
import http from 'http';

export default function (root) {
  const app = connect().use(serveStatic(root));
  return http.createServer(app);
}
