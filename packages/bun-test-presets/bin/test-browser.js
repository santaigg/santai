#!/usr/bin/env node

import { resolve, dirname } from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

// Get current file directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get setup file path
const setupPath = resolve(__dirname, '../browser/setup-dom.ts');

// Combine user args with our defaults
const args = [
  'test',
  '--preload', setupPath,
  '--timeout', '10000',
  ...process.argv.slice(2)
];

// Run bun with our args
spawnSync('bun', args, { stdio: 'inherit' }); 