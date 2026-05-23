// Lightweight Gateway Proxy - always stays running on port 3000
// Proxies to Next.js on port 3001. Shows reconnect page when Next.js is down.
// Auto-restarts Next.js when it crashes.

import http from 'http';
import { spawn } from 'child_process';

const GATEWAY_PORT = 3000;
const NEXT_PORT = 3001;

const RECONNECT_HTML = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>SPMB 2026 - Menghubungkan...</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{min-height:100vh;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#0f172a 0%,#064e3b 50%,#0f172a 100%);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif}
.c{text-align:center;padding:2rem;max-width:400px}
.i{width:64px;height:64px;margin:0 auto 1.5rem;background:rgba(245,158,11,0.2);border-radius:1rem;display:flex;align-items:center;justify-content:center}
.i svg{width:32px;height:32px}
h1{color:#fff;font-size:1.25rem;margin-bottom:.5rem}
p{color:rgba(167,243,208,0.7);font-size:.875rem;line-height:1.5;margin-bottom:1.5rem}
.s{display:flex;align-items:center;justify-content:center;gap:.5rem;color:#fcd34d;font-size:.875rem}
.sp{animation:spin 1s linear infinite;width:16px;height:16px;border:2px solid rgba(252,211,77,0.3);border-top-color:#fcd34d;border-radius:50%}
@keyframes spin{to{transform:rotate(360deg)}}
</style>
</head>
<body>
<div class="c">
<div class="i"><svg fill="none" viewBox="0 0 24 24" stroke="#fbbf24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg></div>
<h1>Server Sedang Memulai</h1>
<p>Sistem SPMB 2026 sedang memulai ulang. Halaman ini akan otomatis terhubung kembali.</p>
<div class="s"><div class="sp"></div><span>Menghubungkan...</span></div>
</div>
<script>
setInterval(function(){fetch('/api/auth/setup',{method:'HEAD'}).then(function(r){if(r.ok)window.location.reload()}).catch(function(){})},3000);
</script>
</body>
</html>`;

let nextProcess = null;
let nextReady = false;
let isStarting = false;
let restartCount = 0;

function proxyRequest(req, res) {
  const options = {
    hostname: '127.0.0.1',
    port: NEXT_PORT,
    path: req.url,
    method: req.method,
    headers: { ...req.headers, host: `localhost:${NEXT_PORT}` },
  };

  const proxyReq = http.request(options, (proxyRes) => {
    // Rewrite location headers to use port 3000
    const headers = { ...proxyRes.headers };
    if (headers.location && headers.location.includes(`:${NEXT_PORT}`)) {
      headers.location = headers.location.replace(`:${NEXT_PORT}`, ':3000');
    }
    res.writeHead(proxyRes.statusCode, headers);
    proxyRes.pipe(res, { end: true });
  });

  proxyReq.on('error', () => {
    res.writeHead(503, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(RECONNECT_HTML);
  });

  proxyReq.setTimeout(10000, () => {
    proxyReq.destroy();
    res.writeHead(503, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(RECONNECT_HTML);
  });

  req.pipe(proxyReq, { end: true });
}

function startNext() {
  if (isStarting) return;
  isStarting = true;
  nextReady = false;

  console.log(`[gateway] Starting Next.js on port ${NEXT_PORT}... (restart #${++restartCount})`);

  nextProcess = spawn('node', ['node_modules/.bin/next', 'dev', '-p', String(NEXT_PORT)], {
    cwd: '/home/z/my-project',
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, PORT: String(NEXT_PORT) },
  });

  nextProcess.stdout.on('data', (data) => {
    const output = data.toString();
    process.stdout.write(output); // Pass through to gateway log
    if (output.includes('Ready') || output.includes('✓ Ready')) {
      nextReady = true;
      isStarting = false;
      console.log('[gateway] Next.js is ready!');
    }
  });

  nextProcess.stderr.on('data', (data) => {
    process.stderr.write(data);
  });

  nextProcess.on('exit', (code) => {
    console.log(`[gateway] Next.js exited with code ${code}`);
    nextReady = false;
    isStarting = false;
    // Restart after 2 seconds
    setTimeout(startNext, 2000);
  });

  nextProcess.on('error', (err) => {
    console.error(`[gateway] Failed to start Next.js: ${err.message}`);
    isStarting = false;
    setTimeout(startNext, 3000);
  });
}

// Create gateway server
const server = http.createServer((req, res) => {
  if (nextReady) {
    proxyRequest(req, res);
  } else {
    // Quick check if Next.js might be up
    const checkReq = http.get(`http://127.0.0.1:${NEXT_PORT}/api/auth/setup`, (checkRes) => {
      if (checkRes.statusCode === 200 || checkRes.statusCode === 401) {
        nextReady = true;
        checkRes.resume();
        proxyRequest(req, res);
      } else {
        checkRes.resume();
        res.writeHead(503, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(RECONNECT_HTML);
      }
    });
    checkReq.on('error', () => {
      res.writeHead(503, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(RECONNECT_HTML);
    });
    checkReq.setTimeout(2000, () => {
      checkReq.destroy();
      res.writeHead(503, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(RECONNECT_HTML);
    });
  }
});

// Periodic health check
setInterval(() => {
  if (nextReady) {
    const req = http.get(`http://127.0.0.1:${NEXT_PORT}/api/auth/setup`, (res) => {
      if (res.statusCode !== 200) {
        nextReady = false;
      }
      res.resume();
    });
    req.on('error', () => { nextReady = false; });
    req.setTimeout(3000, () => { req.destroy(); nextReady = false; });
  }
}, 5000);

server.listen(GATEWAY_PORT, '0.0.0.0', () => {
  console.log(`[gateway] Gateway running on port ${GATEWAY_PORT}`);
  console.log(`[gateway] Proxying to Next.js on port ${NEXT_PORT}`);
  startNext();
});
