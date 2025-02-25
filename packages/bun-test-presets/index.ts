/**
 * Unified test setup for all packages in the monorepo
 * 
 * This file will:
 * 1. Set up the DOM environment for all tests
 * 2. Set up any other global test configurations
 */

// Import the DOM setup
import './browser/setup-dom';

// Export a setup function that can be called directly
export function setupTestEnvironment() {
  console.log('Test setup complete.');
}

// Run the setup automatically when this file is loaded as a preload script
console.log('Setting up DOM environment for tests...');
setupTestEnvironment(); 