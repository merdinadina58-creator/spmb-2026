/**
 * Post-build optimization script
 * Removes unnecessary files from the standalone build to reduce deployment size
 */

/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

const standaloneDir = path.join(__dirname, '..', '.next', 'standalone');

if (!fs.existsSync(standaloneDir)) {
  console.log('No standalone build found, skipping optimization');
  process.exit(0);
}

let savedBytes = 0;

function removeDir(dirPath, label) {
  const fullPath = path.join(standaloneDir, dirPath);
  if (fs.existsSync(fullPath)) {
    const stats = getDirSize(fullPath);
    fs.rmSync(fullPath, { recursive: true, force: true });
    savedBytes += stats;
    console.log(`✓ Removed ${label}: ${formatBytes(stats)}`);
  }
}

function removeFiles(dirPath, pattern, label) {
  const fullPath = path.join(standaloneDir, dirPath);
  if (!fs.existsSync(fullPath)) return;

  const files = fs.readdirSync(fullPath);
  for (const file of files) {
    if (pattern.test(file)) {
      const filePath = path.join(fullPath, file);
      const stat = fs.statSync(filePath);
      fs.rmSync(filePath, { force: true });
      savedBytes += stat.size;
    }
  }
  console.log(`✓ Cleaned ${label}`);
}

function getDirSize(dirPath) {
  let size = 0;
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      size += getDirSize(filePath);
    } else {
      size += stat.size;
    }
  }
  return size;
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// Remove @img/sharp binaries (not needed with images.unoptimized)
removeDir('node_modules/@img', '@img/sharp binaries');

// Remove typescript (not needed at runtime)
removeDir('node_modules/typescript', 'typescript runtime');

// Remove non-postgresql WASM engines from Prisma
const prismaRuntime = 'node_modules/@prisma/client/runtime';
removeFiles(prismaRuntime, /^(query_compiler_bg|query_engine_bg)\.(cockroachdb|mysql|sqlserver|sqlite)\./, 'non-postgresql Prisma engines');

console.log(`\n✅ Total saved: ${formatBytes(savedBytes)}`);
console.log(`📦 Standalone build optimized`);
