#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

// Check for help flag
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log('🧹 Node Modules Cleanup Tool');
  console.log('---------------------------');
  console.log('\nUsage: node clean-node-modules.js [options]');
  console.log('\nOptions:');
  console.log('  --help, -h     Show this help message');
  console.log('  --yes, -y      Skip confirmation and delete all node_modules directories');
  console.log('\nDescription:');
  console.log('  This script finds and removes all node_modules directories in the current');
  console.log('  workspace, excluding directories that start with a period (.).');
  console.log('\nExamples:');
  console.log('  node clean-node-modules.js         Interactive mode with confirmation');
  console.log('  node clean-node-modules.js --yes   Delete all node_modules without confirmation');
  process.exit(0);
}

// Check for yes flag
const skipConfirmation = process.argv.includes('--yes') || process.argv.includes('-y');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to get the size of a directory in a human-readable format
function getDirectorySize(dirPath) {
  try {
    // Use du command on Unix-like systems or PowerShell on Windows
    if (process.platform === 'win32') {
      const output = execSync(`powershell -command "(Get-ChildItem -Path '${dirPath}' -Recurse | Measure-Object -Property Length -Sum).Sum"`, { encoding: 'utf8' });
      const bytes = parseInt(output.trim());
      return formatBytes(bytes);
    } else {
      const output = execSync(`du -sh "${dirPath}" | cut -f1`, { encoding: 'utf8' });
      return output.trim();
    }
  } catch (error) {
    return 'unknown size';
  }
}

// Function to format bytes to a human-readable format
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Function to find all node_modules directories
function findNodeModules(startPath, excludeDotDirs = true) {
  if (!fs.existsSync(startPath)) {
    console.error(`Directory not found: ${startPath}`);
    return [];
  }

  let nodeModulesPaths = [];

  try {
    const entries = fs.readdirSync(startPath, { withFileTypes: true });
    
    // Check if current directory has node_modules
    if (entries.some(entry => entry.isDirectory() && entry.name === 'node_modules')) {
      const nodeModulesPath = path.join(startPath, 'node_modules');
      const size = getDirectorySize(nodeModulesPath);
      nodeModulesPaths.push({ path: nodeModulesPath, size });
    }
    
    // Recursively check subdirectories
    for (const entry of entries) {
      if (entry.isDirectory()) {
        // Skip directories that start with a dot if excludeDotDirs is true
        if (excludeDotDirs && entry.name.startsWith('.')) {
          continue;
        }
        
        // Skip node_modules directories to avoid recursing into them
        if (entry.name === 'node_modules') {
          continue;
        }
        
        const subdir = path.join(startPath, entry.name);
        const subResults = findNodeModules(subdir, excludeDotDirs);
        nodeModulesPaths = nodeModulesPaths.concat(subResults);
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${startPath}: ${error.message}`);
  }
  
  return nodeModulesPaths;
}

// Function to delete a directory
function deleteDirectory(dirPath) {
  try {
    fs.rmSync(dirPath, { recursive: true, force: true });
    return true;
  } catch (error) {
    console.error(`Error deleting ${dirPath}: ${error.message}`);
    return false;
  }
}

// Main function
async function main() {
  console.log('🧹 Node Modules Cleanup Tool');
  console.log('---------------------------\n');
  
  console.log('Searching for node_modules directories...');
  const rootDir = process.cwd();
  const nodeModulesDirs = findNodeModules(rootDir);
  
  if (nodeModulesDirs.length === 0) {
    console.log('No node_modules directories found.');
    rl.close();
    return;
  }
  
  console.log(`\nFound ${nodeModulesDirs.length} node_modules directories:\n`);
  
  // Calculate total size
  let totalSize = 0;
  
  // Display found directories with their sizes
  nodeModulesDirs.forEach((dir, index) => {
    console.log(`${index + 1}. ${dir.path} (${dir.size})`);
  });
  
  console.log('\nTotal directories to remove:', nodeModulesDirs.length);
  
  if (skipConfirmation) {
    deleteNodeModules(nodeModulesDirs);
  } else {
    rl.question('\nDo you want to delete all these node_modules directories? (y/n): ', (answer) => {
      if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
        deleteNodeModules(nodeModulesDirs);
      } else {
        console.log('Operation cancelled.');
        rl.close();
      }
    });
  }
}

// Function to delete node_modules directories
function deleteNodeModules(nodeModulesDirs) {
  console.log('\nDeleting node_modules directories...');
  
  let successCount = 0;
  let failCount = 0;
  
  nodeModulesDirs.forEach((dir) => {
    process.stdout.write(`Deleting ${dir.path}... `);
    const success = deleteDirectory(dir.path);
    
    if (success) {
      console.log('✅ Done');
      successCount++;
    } else {
      console.log('❌ Failed');
      failCount++;
    }
  });
  
  console.log(`\n✅ Successfully deleted ${successCount} node_modules directories.`);
  
  if (failCount > 0) {
    console.log(`❌ Failed to delete ${failCount} directories.`);
  }
  
  console.log('\n🎉 Cleanup completed!');
  rl.close();
}

// Run the script
main(); 