import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
const root = path.resolve('public');
const port = Number(process.argv[2] || 4173);
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8' };
http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://127.0.0.1:${port}`);
    const pathname = decodeURIComponent(url.pathname);
    if (pathname.endsWith('.html') && pathname !== '/404.html') {
      response.writeHead(307, { Location: (pathname === '/index.html' ? '/' : pathname.slice(0, -5)) + url.search }); response.end(); return;
    }
    let file = path.resolve(root, `.${pathname === '/' ? '/index.html' : pathname}`);
    if (!file.startsWith(root + path.sep)) { response.writeHead(403); response.end(); return; }
    if (!path.extname(file)) file += '.html';
    let code = 200;
    try { if (!(await stat(file)).isFile()) throw new Error('not a file'); }
    catch { file = path.join(root, '404.html'); code = 404; }
    response.writeHead(code, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    response.end(await readFile(file));
  } catch { response.writeHead(400); response.end('Bad request'); }
}).listen(port, '127.0.0.1', () => console.log(`Aperçu : http://127.0.0.1:${port}`));
