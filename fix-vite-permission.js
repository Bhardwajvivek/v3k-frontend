// fix-vite-permission.js

import fs from 'fs';
import path from 'path';
import { chmodSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Manually fix vite binary permission
chmodSync(path.resolve(__dirname, 'node_modules/.bin/vite'), 0o755);

const binPath = path.join('node_modules', '.bin');
const vitePath = path.join(binPath, 'vite.cmd'); // Windows CMD version

if (fs.existsSync(vitePath)) {
  console.log('✅ vite.cmd is present for Windows.');
} else {
  console.error('❌ vite.cmd not found. Please reinstall Vite.');
}
