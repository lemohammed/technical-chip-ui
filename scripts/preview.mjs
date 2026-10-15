import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = fileURLToPath(new URL('../assets/starter/', import.meta.url));
const port = Number(process.env.PORT || 4186);
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8'};
const server = createServer(async (request,response) => {
  if (!['GET','HEAD'].includes(request.method)) {response.writeHead(405);response.end();return;}
  try {
    const pathname = decodeURIComponent(new URL(request.url,'http://localhost').pathname);
    const file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (!file.startsWith(root)) {response.writeHead(403);response.end();return;}
    const content = await readFile(file);
    response.writeHead(200,{'Content-Type':types[path.extname(file)] || 'application/octet-stream','Cache-Control':'no-store'});
    response.end(request.method === 'HEAD' ? undefined : content);
  } catch {response.writeHead(404);response.end('Not found');}
});
server.listen(port,'127.0.0.1',() => console.log(`Local demo: http://127.0.0.1:${port}`));
process.on('SIGINT',() => server.close(() => process.exit(0)));
