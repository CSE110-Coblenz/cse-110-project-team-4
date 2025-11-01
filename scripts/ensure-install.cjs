// scripts/ensure-install.cjs
// Auto installation requires the following environment
const fs = require('fs');
const cp = require('child_process');

try {
  const needsInstall =
    !fs.existsSync('node_modules') ||
    (fs.existsSync('node_modules') && fs.readdirSync('node_modules').length === 0);

  if (needsInstall) {
    console.log('[setup] node_modules not found. Installing dependencies...');
    cp.execSync('npm install', { stdio: 'inherit' });
  }
} catch (err) {
  console.error('[setup] Failed to ensure dependencies:', err);
  process.exit(1);
}
