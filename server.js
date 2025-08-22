import { createServer } from 'http';
import { promises as fs } from 'fs';
import { extname, join } from 'path';
import { fileURLToPath } from 'url';

// Basic static file server with logging.
// Serves public/ as root and maps /src, /colors, /tiles.
const root = fileURLToPath(new URL('.', import.meta.url));
const mappings = { '/src': 'src', '/colors': 'colors', '/tiles': 'tiles' };
const isDev = process.env.NODE_ENV !== 'production';

function mapPath(urlPath) {
  for (const [prefix, dir] of Object.entries(mappings)) {
    if (urlPath.startsWith(prefix)) {
      return join(root, dir, urlPath.slice(prefix.length));
    }
  }
  return join(root, 'public', urlPath);
}

function mime(ext) {
  return {
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.html': 'text/html'
  }[ext] || 'application/octet-stream';
}

function handler(req, res) {
  const urlPath = new URL(req.url, 'http://localhost').pathname;
  const filePath = mapPath(urlPath === '/' ? '/index.html' : urlPath);
  fs.appendFile('log.txt', `${new Date().toISOString()} ${req.method} ${req.url}\n`, () => {});
  fs.readFile(filePath)
    .then(data => {
      if (isDev) res.setHeader('Cache-Control', 'no-store');
      res.statusCode = 200;
      res.setHeader('Content-Type', mime(extname(filePath)));
      res.end(data);
    })
    .catch(() => {
      res.statusCode = 404;
      res.end('Not found');
    });
}

export function start(port = 3000) {
  const server = createServer(handler);
  return server.listen(port, () =>
    console.log(`Server running at http://localhost:${port}`)
  );
}

if (import.meta.url === `file://${process.argv[1]}`) {
  start();
}
