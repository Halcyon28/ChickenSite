const http = require('http');
const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const envPath = path.join(rootDir, '.env');

function parseEnv(filePath) {
  const env = {};
  if (!fs.existsSync(filePath)) return env;

  const contents = fs.readFileSync(filePath, 'utf8');
  contents.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) return;
    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();
    env[key] = value;
  });

  return env;
}

const env = parseEnv(envPath);
const apiKey = env.NASA_API_KEY;

if (!apiKey) {
  console.error(`Missing NASA_API_KEY in ${envPath}`);
}

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.html':
      return 'text/html; charset=utf-8';
    case '.css':
      return 'text/css; charset=utf-8';
    case '.js':
      return 'application/javascript; charset=utf-8';
    case '.json':
      return 'application/json; charset=utf-8';
    case '.png':
      return 'image/png';
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.svg':
      return 'image/svg+xml';
    default:
      return 'application/octet-stream';
  }
}

function sendFile(res, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not found');
      return;
    }

    res.writeHead(200, { 'Content-Type': getContentType(filePath) });
    res.end(data);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');

  if (url.pathname === '/api/apod') {
    const date = url.searchParams.get('date') || '';
    const apiUrl = date
      ? `https://api.nasa.gov/planetary/apod?api_key=${apiKey}&date=${encodeURIComponent(date)}`
      : `https://api.nasa.gov/planetary/apod?api_key=${apiKey}`;

    try {
      const response = await fetch(apiUrl);
      const data = await response.json();
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(data));
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: 'Unable to load APOD data' }));
    }
    return;
  }

  let requestedPath = url.pathname === '/' ? '/index.html' : url.pathname;
  if (requestedPath.endsWith('/')) requestedPath += 'index.html';

  const safePath = path.normalize(path.join(rootDir, requestedPath));
  if (!safePath.startsWith(rootDir)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Forbidden');
    return;
  }

  if (!fs.existsSync(safePath)) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
    return;
  }

  const stat = fs.statSync(safePath);
  if (stat.isDirectory()) {
    sendFile(res, path.join(safePath, 'index.html'));
  } else {
    sendFile(res, safePath);
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`APOD server running at http://localhost:${PORT}`);
});
