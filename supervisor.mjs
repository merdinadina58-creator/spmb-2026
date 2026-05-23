import { spawn } from 'child_process'

const LOG_FILE = '/home/z/my-project/dev.log'
const DAEMON_LOG = '/home/z/my-project/supervisor-daemon.log'

function log(msg) {
  const line = `${new Date().toISOString()}: ${msg}\n`
  Bun.write(DAEMON_LOG, line, { append: true })
}

let serverProcess = null
let restartCount = 0

function startServer() {
  if (serverProcess) {
    try { serverProcess.kill() } catch {}
  }
  
  log(`Starting server (restart #${restartCount})`)
  
  serverProcess = spawn('./node_modules/.bin/next', ['dev', '-p', '3000'], {
    cwd: '/home/z/my-project',
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: false,
  })
  
  serverProcess.stdout.on('data', (data) => {
    Bun.write(LOG_FILE, data, { append: true })
  })
  
  serverProcess.stderr.on('data', (data) => {
    Bun.write(LOG_FILE, data, { append: true })
  })
  
  serverProcess.on('exit', (code) => {
    log(`Server exited with code ${code}`)
    restartCount++
    setTimeout(startServer, 1500)
  })
  
  serverProcess.on('error', (err) => {
    log(`Server error: ${err.message}`)
    setTimeout(startServer, 2000)
  })
}

startServer()

// Keep the process alive
setInterval(() => {
  // Health check - just log periodically
  log('Health check: supervisor running')
}, 60000)

// Don't exit
process.on('SIGTERM', () => { log('Received SIGTERM') })
process.on('SIGINT', () => { log('Received SIGINT') })
