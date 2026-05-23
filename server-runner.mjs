import { spawn } from 'child_process';

function startServer() {
  console.log('[Runner] Starting Next.js server...');
  const proc = spawn('npx', ['next', 'dev', '-p', '3000'], {
    stdio: 'inherit',
    shell: true
  });
  
  proc.on('exit', (code) => {
    console.log(`[Runner] Server exited with code ${code}, restarting in 3s...`);
    setTimeout(startServer, 3000);
  });
  
  proc.on('error', (err) => {
    console.error('[Runner] Error:', err);
    setTimeout(startServer, 3000);
  });
}

startServer();

import http from 'http';

// Keepalive: ping every 5s
setInterval(() => {
  try {
    http.get('http://localhost:3000/api/auth/setup', (res) => {
      res.resume();
    }).on('error', () => {});
  } catch {}
}, 5000);
