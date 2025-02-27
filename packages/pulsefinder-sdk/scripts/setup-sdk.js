#!/usr/bin/env bun

/**
 * This script helps set up the PulseFinder SDK in another package within the monorepo.
 * It creates a basic example file and adds the necessary environment variables.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Get the target package directory
rl.question('Enter the target package directory (e.g., apps/web): ', (targetDir) => {
  const fullTargetDir = path.resolve(process.cwd(), '../../', targetDir);
  
  // Check if the directory exists
  if (!fs.existsSync(fullTargetDir)) {
    console.error(`Directory ${fullTargetDir} does not exist.`);
    rl.close();
    return;
  }
  
  // Create example file
  const exampleFile = path.join(fullTargetDir, 'src/lib/pulsefinder.ts');
  const exampleDir = path.dirname(exampleFile);
  
  if (!fs.existsSync(exampleDir)) {
    fs.mkdirSync(exampleDir, { recursive: true });
  }
  
  const exampleContent = `/**
 * PulseFinder SDK integration example
 */
import { PulseFinder } from '@repo/pulsefinder-sdk';

// Create a singleton instance of the PulseFinder SDK
let pulsefinderInstance: PulseFinder | null = null;

export function getPulseFinder(): PulseFinder {
  if (!pulsefinderInstance) {
    pulsefinderInstance = new PulseFinder({
      // API key is only required in production
      ...(process.env.NODE_ENV === 'production' && { 
        apiKey: process.env.PULSEFINDER_API_KEY 
      }),
      // Custom API URL if needed
      ...(process.env.PULSEFINDER_API_URL && { 
        baseUrl: process.env.PULSEFINDER_API_URL 
      }),
    });
  }
  
  return pulsefinderInstance;
}

// Example usage:
// import { getPulseFinder } from '@/lib/pulsefinder';
//
// async function getPlayerProfile(playerId: string) {
//   const pulsefinder = getPulseFinder();
//   return await pulsefinder.player.getPlayerProfile(playerId);
// }
`;
  
  fs.writeFileSync(exampleFile, exampleContent);
  console.log(`Created example file at ${exampleFile}`);
  
  // Update .env.example file if it exists
  const envExampleFile = path.join(fullTargetDir, '.env.example');
  
  if (fs.existsSync(envExampleFile)) {
    let envContent = fs.readFileSync(envExampleFile, 'utf8');
    
    // Add PulseFinder environment variables if they don't exist
    if (!envContent.includes('PULSEFINDER_API_KEY')) {
      envContent += `\n# PulseFinder SDK (only required in production)
PULSEFINDER_API_KEY=your_api_key_here

# Optional: Custom PulseFinder API URL
# PULSEFINDER_API_URL=https://api.pulsefinder.example.com
`;
      
      fs.writeFileSync(envExampleFile, envContent);
      console.log(`Updated .env.example file at ${envExampleFile}`);
    }
  }
  
  // Check if the package.json exists and has @repo/pulsefinder-sdk as a dependency
  const packageJsonFile = path.join(fullTargetDir, 'package.json');
  
  if (fs.existsSync(packageJsonFile)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonFile, 'utf8'));
    
    // Check if @repo/pulsefinder-sdk is already a dependency
    const hasDependency = (
      (packageJson.dependencies && packageJson.dependencies['@repo/pulsefinder-sdk']) ||
      (packageJson.devDependencies && packageJson.devDependencies['@repo/pulsefinder-sdk'])
    );
    
    if (!hasDependency) {
      console.log(`\nTo add the SDK as a dependency, run the following command from the monorepo root:`);
      console.log(`bun add --cwd ${targetDir} @repo/pulsefinder-sdk@workspace:*`);
    }
  }
  
  console.log('\nSetup complete! You can now use the PulseFinder SDK in your package.');
  rl.close();
}); 