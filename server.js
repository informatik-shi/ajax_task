import http from 'node:http';
import { readFile } from 'node:fs/promises';

const files = {
  '/': ['index.html', 'text/html; charset=utf-8'],
  '/index.html': ['index.html', 'text/html; charset=utf-8'],
  '/main.js': ['main.js', 'text/javascript; charset=utf-8'],
  '/api.js': ['api.js', 'text/javascript; charset=utf-8'],
  '/db.json': ['db.json', 'application/json; charset=utf-8'],
};

http.createServer(async (request, response) => {
  const file = files[new URL(request.url, 'http://localhost').pathname];
  if (request.method !== 'GET' || !file) {
    response.writeHead(404);
    response.end('Not found');
    return;
  }

  try {
    const content = await readFile(new URL(`./${file[0]}`, import.meta.url));
    response.writeHead(200, { 'Content-Type': file[1] });
    response.end(content);
  } catch {
    response.writeHead(500);
    response.end('Server error');
  }
}).listen(3000, '127.0.0.1', () => {
  console.log('Откройте http://127.0.0.1:3000');
});
