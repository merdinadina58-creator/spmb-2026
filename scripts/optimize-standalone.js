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
  try {
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
  } catch (e) {
    // ignore permission errors
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

// Remove sharp package itself
removeDir('node_modules/sharp', 'sharp package');

// Remove typescript (not needed at runtime)
removeDir('node_modules/typescript', 'typescript runtime');

// Remove prisma (we use @neondatabase/serverless directly)
removeDir('node_modules/@prisma', '@prisma packages');
removeDir('node_modules/prisma', 'prisma CLI');

// Remove other unused heavy packages if they somehow ended up in standalone
removeDir('node_modules/@mdxeditor', '@mdxeditor packages');
removeDir('node_modules/framer-motion', 'framer-motion');
removeDir('node_modules/next-auth', 'next-auth');
removeDir('node_modules/react-syntax-highlighter', 'react-syntax-highlighter');
removeDir('node_modules/@tanstack', '@tanstack packages');
removeDir('node_modules/@dnd-kit', '@dnd-kit packages');
removeDir('node_modules/ws', 'ws');
removeDir('node_modules/date-fns', 'date-fns');
removeDir('node_modules/react-markdown', 'react-markdown');
removeDir('node_modules/next-intl', 'next-intl');
removeDir('node_modules/zustand', 'zustand');
removeDir('node_modules/zod', 'zod');
removeDir('node_modules/uuid', 'uuid');

console.log(`\n✅ Total saved: ${formatBytes(savedBytes)}`);

// Report final size
const finalSize = getDirSize(standaloneDir);
console.log(`📦 Final standalone size: ${formatBytes(finalSize)}`);
