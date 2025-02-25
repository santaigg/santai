#!/usr/bin/env node

import { spawnSync } from 'child_process';

// Combine user args with our defaults
const args = [
  'test',
  '--timeout', '10000',
  ...process.argv.slice(2)
];

// Run bun with our args
spawnSync('bun', args, { stdio: 'inherit' }); 