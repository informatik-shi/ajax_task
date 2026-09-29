import http from 'node:http';
import { readFile } from 'node:fs/promises';

const files = {
  '/': ['index.html', 'text/html; charset=utf-8'],
  '/index.html': ['index.html', 'text/html; charset=utf-8'],
  '/main.js': ['main.js', 'text/javascript; charset=utf-8'],
  '/api.js': ['api.js', 'text/javascript; charset=utf-8'],
  '/db.json': ['db.json', 'application/json; charset=utf-8'],
  '/heroes.html': ['heroes.html', 'text/html; charset=utf-8'],
  '/heroes.js': ['heroes.js', 'text/javascript; charset=utf-8'],
  '/heroes.css': ['heroes.css', 'text/css; charset=utf-8'],
  '/dbHeroes.json': ['dbHeroes.json', 'application/json; charset=utf-8'],
};

http.createServer(async (request, response) => {
  const pathname = new URL(request.url, 'http://localhost').pathname;
  let file = files[pathname];

  // Разрешаем только имена файлов из папки с изображениями.
  if (!file && pathname.startsWith('/dbimage/')) {
    let name;
    try {
      name = decodeURIComponent(pathname.slice('/dbimage/'.length));
    } catch {
      name = '';
    }
    if (/^[a-zA-Z0-9_.()-]+\.(jpg|png)$/i.test(name)) {
      file = [`dbimage/${name}`, name.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg'];
    }
  }

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
    response.writeHead(404);
    response.end('Not found');
  }
}).listen(3000, '127.0.0.1', () => {
  console.log('Откройте http://127.0.0.1:3000');
});
