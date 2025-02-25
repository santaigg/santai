#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync } = require('child_process');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper function to create directories recursively
function createDirectoryIfNotExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
}

// Helper function to create a file with content
function createFile(filePath, content) {
  fs.writeFileSync(filePath, content);
  console.log(`Created file: ${filePath}`);
}

// Helper function to copy a file
function copyFile(source, destination) {
  fs.copyFileSync(source, destination);
  console.log(`Copied file from ${source} to ${destination}`);
}

// Helper function to delete a directory recursively
function deleteDirectory(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
    console.log(`Deleted directory: ${dirPath}`);
  }
}

// Function to create a workspace from a git repository
function createFromGitRepo(name, repoUrl, workspaceType) {
  const isApp = workspaceType === 'app';
  const baseDir = isApp ? 'apps' : 'packages';
  const targetDir = path.join(process.cwd(), baseDir, name);
  
  console.log(`\nCloning repository: ${repoUrl}`);
  
  try {
    // Clone the repository
    execSync(`git clone ${repoUrl} ${targetDir}`, { stdio: 'inherit' });
    
    // Remove the .git directory
    const gitDir = path.join(targetDir, '.git');
    deleteDirectory(gitDir);
    
    console.log(`\nRemoved .git directory from the cloned repository.`);
    
    // Ask for more specific configuration based on the workspace type
    if (isApp) {
      configureImportedApp(name, targetDir);
    } else {
      configureImportedPackage(name, targetDir);
    }
    
  } catch (error) {
    console.error(`\n❌ Failed to clone repository: ${error.message}`);
    // Clean up if the directory was created
    if (fs.existsSync(targetDir)) {
      deleteDirectory(targetDir);
    }
    throw error;
  }
}

// Function to interactively configure an imported app
function configureImportedApp(name, targetDir) {
  console.log('\nConfiguring the imported app...');
  
  const appTypePromise = new Promise((resolve) => {
    rl.question('What type of app is this?\n1. Next.js\n2. React (Vite)\n3. Other\nEnter choice (1-3): ', (appType) => {
      resolve(appType);
    });
  });
  
  appTypePromise.then((appType) => {
    let appTypeLabel = '';
    let tsConfigExtends = '';
    let eslintConfigImport = '';
    
    switch (appType) {
      case '1':
        appTypeLabel = 'Next.js';
        tsConfigExtends = '@repo/typescript-config/nextjs.json';
        eslintConfigImport = '@repo/eslint-config/next';
        break;
      case '2':
        appTypeLabel = 'React (Vite)';
        tsConfigExtends = '@repo/typescript-config/react-app.json';
        eslintConfigImport = '@repo/eslint-config/react';
        break;
      default:
        appTypeLabel = 'Custom';
        tsConfigExtends = '@repo/typescript-config/base.json';
        eslintConfigImport = '@repo/eslint-config/base';
        break;
    }
    
    console.log(`\nConfiguring as a ${appTypeLabel} app...`);
    
    // Ask which monorepo packages to include
    return new Promise((resolve) => {
      rl.question('\nWhich monorepo packages would you like to include? (comma-separated, leave empty for none)\nAvailable packages: ui, logger, config-typescript, config-eslint\n', (packagesInput) => {
        const selectedPackages = packagesInput.split(',').map(p => p.trim()).filter(Boolean);
        resolve({ appType, appTypeLabel, tsConfigExtends, eslintConfigImport, selectedPackages });
      });
    });
  }).then(({ appType, appTypeLabel, tsConfigExtends, eslintConfigImport, selectedPackages }) => {
    // Handle package.json
    const packageJsonPath = path.join(targetDir, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      // Backup original package.json
      const backupPackageJsonPath = path.join(targetDir, 'package.json-old');
      fs.copyFileSync(packageJsonPath, backupPackageJsonPath);
      console.log(`Backed up original package.json to package.json-old`);
      
      // Read the original package.json
      const originalPackageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      // Create a new package.json with monorepo configuration
      const newPackageJson = {
        name,
        version: originalPackageJson.version || "0.0.0",
        private: true,
        type: originalPackageJson.type || "module",
        scripts: {
          ...(originalPackageJson.scripts || {}),
          "check-types": "tsc --noEmit"
        },
        dependencies: {
          ...(originalPackageJson.dependencies || {})
        },
        devDependencies: {
          ...(originalPackageJson.devDependencies || {}),
          "@repo/eslint-config": "*",
          "@repo/typescript-config": "*"
        }
      };
      
      // Add selected monorepo packages
      if (selectedPackages.includes('ui')) {
        newPackageJson.dependencies["@repo/ui"] = "*";
      }
      
      if (selectedPackages.includes('logger')) {
        newPackageJson.dependencies["@repo/logger"] = "*";
      }
      
      // Clean up undefined properties
      Object.keys(newPackageJson).forEach(key => {
        if (newPackageJson[key] === undefined) {
          delete newPackageJson[key];
        }
      });
      
      // Save the new package.json
      fs.writeFileSync(packageJsonPath, JSON.stringify(newPackageJson, null, 2));
      console.log(`Updated package.json with monorepo configuration.`);
    }
    
    // Handle tsconfig.json
    const tsconfigPath = path.join(targetDir, 'tsconfig.json');
    if (fs.existsSync(tsconfigPath)) {
      // Backup original tsconfig.json
      const backupTsconfigPath = path.join(targetDir, 'tsconfig.json-old');
      fs.copyFileSync(tsconfigPath, backupTsconfigPath);
      console.log(`Backed up original tsconfig.json to tsconfig.json-old`);
      
      // Create a new tsconfig.json with monorepo configuration
      const tsConfig = {
        extends: tsConfigExtends,
        compilerOptions: {
          baseUrl: ".",
          paths: {
            "@/*": ["./src/*"]
          }
        },
        include: ["src"],
        exclude: ["node_modules", "dist"]
      };
      
      // For Next.js, add specific configurations
      if (appType === '1') {
        tsConfig.compilerOptions.plugins = [{ name: "next" }];
        tsConfig.include = ["src", "next.config.ts", "next-env.d.ts", ".next/types/**/*.ts"];
      }
      
      // Save the new tsconfig.json
      fs.writeFileSync(tsconfigPath, JSON.stringify(tsConfig, null, 2));
      console.log(`Updated tsconfig.json with monorepo configuration.`);
    }
    
    // Handle eslint configuration
    const eslintConfigPath = path.join(targetDir, '.eslintrc.js');
    const eslintConfigJsonPath = path.join(targetDir, '.eslintrc.json');
    const eslintConfigYamlPath = path.join(targetDir, '.eslintrc.yaml');
    const eslintConfigYmlPath = path.join(targetDir, '.eslintrc.yml');
    const eslintrcPath = path.join(targetDir, '.eslintrc');
    const newEslintConfigPath = path.join(targetDir, 'eslint.config.js');
    
    // Check for any existing eslint config files
    const eslintPaths = [
      eslintConfigPath, 
      eslintConfigJsonPath, 
      eslintConfigYamlPath, 
      eslintConfigYmlPath, 
      eslintrcPath
    ];
    
    let foundEslintConfig = false;
    
    for (const configPath of eslintPaths) {
      if (fs.existsSync(configPath)) {
        // Backup original eslint config
        const backupPath = `${configPath}-old`;
        fs.copyFileSync(configPath, backupPath);
        console.log(`Backed up original eslint config to ${path.basename(backupPath)}`);
        foundEslintConfig = true;
      }
    }
    
    // Create a new eslint.config.js with monorepo configuration
    const eslintConfig = `import { config } from "${eslintConfigImport}";

/** @type {import("eslint").Linter.Config} */
export default config;`;
    
    fs.writeFileSync(newEslintConfigPath, eslintConfig);
    console.log(`Created eslint.config.js with monorepo configuration.`);
    
    // Create turbo.json if it doesn't exist
    const turboJsonPath = path.join(targetDir, 'turbo.json');
    if (fs.existsSync(turboJsonPath)) {
      // Backup original turbo.json
      const backupTurboJsonPath = path.join(targetDir, 'turbo.json-old');
      fs.copyFileSync(turboJsonPath, backupTurboJsonPath);
      console.log(`Backed up original turbo.json to turbo.json-old`);
    }
    
    // Create a new turbo.json with monorepo configuration
    const turboConfig = {
      extends: ["//"],
      tasks: {
        build: {
          outputs: appType === '1' ? [".next/**", "!.next/cache/**"] : ["dist/**"]
        }
      }
    };
    
    fs.writeFileSync(turboJsonPath, JSON.stringify(turboConfig, null, 2));
    console.log(`Updated turbo.json with monorepo configuration.`);
    
    // Handle Next.js configuration if it's a Next.js app
    if (appType === '1') {
      const nextConfigPath = path.join(targetDir, 'next.config.js');
      const nextConfigTsPath = path.join(targetDir, 'next.config.ts');
      
      // Check if there's an existing Next.js config
      if (fs.existsSync(nextConfigPath)) {
        // Backup original next.config.js
        const backupNextConfigPath = path.join(targetDir, 'next.config.js-old');
        fs.copyFileSync(nextConfigPath, backupNextConfigPath);
        console.log(`Backed up original next.config.js to next.config.js-old`);
      } else if (fs.existsSync(nextConfigTsPath)) {
        // Backup original next.config.ts
        const backupNextConfigPath = path.join(targetDir, 'next.config.ts-old');
        fs.copyFileSync(nextConfigTsPath, backupNextConfigPath);
        console.log(`Backed up original next.config.ts to next.config.ts-old`);
      }
      
      // Create a new next.config.ts with monorepo configuration
      const transpilePackages = selectedPackages.includes('ui') ? '["@repo/ui"]' : '[]';
      const nextConfig = `
import { withTurbo } from "turbo/next";

/** @type {import('next').NextConfig} */
export default withTurbo({
  reactStrictMode: true,
  transpilePackages: ${transpilePackages},
  eslint: {
    ignoreDuringBuilds: true,
  },
});
`;
      
      fs.writeFileSync(nextConfigTsPath, nextConfig);
      console.log(`Created/Updated next.config.ts with monorepo configuration.`);
    }
    
    console.log(`\n✅ Successfully created app from git repository: ${name}`);
    console.log(`\nOriginal configuration files have been preserved with a -old suffix.`);
    console.log(`You may need to manually merge some configurations if the automatic conversion missed anything.`);
    
    // Print next steps
    console.log('\n🎉 Done! Happy coding!');
    console.log('\nNext steps:');
    console.log(`1. cd apps/${name}`);
    console.log('2. bun install');
    console.log('3. Review and update configuration files as needed');
    console.log('4. cd ../../');
    console.log('5. bun dev');
    
    // Close the readline interface
    rl.close();
  });
}

// Function to interactively configure an imported package
function configureImportedPackage(name, targetDir) {
  console.log('\nConfiguring the imported package...');
  
  const packageTypePromise = new Promise((resolve) => {
    rl.question('What type of package is this?\n1. UI Component Library\n2. Utility Library\n3. Other\nEnter choice (1-3): ', (packageType) => {
      resolve(packageType);
    });
  });
  
  packageTypePromise.then((packageType) => {
    let packageTypeLabel = '';
    let tsConfigExtends = '';
    let eslintConfigImport = '';
    let isUILibrary = false;
    
    switch (packageType) {
      case '1':
        packageTypeLabel = 'UI Component Library';
        tsConfigExtends = '@repo/typescript-config/react-library.json';
        eslintConfigImport = '@repo/eslint-config/library';
        isUILibrary = true;
        break;
      case '2':
        packageTypeLabel = 'Utility Library';
        tsConfigExtends = '@repo/typescript-config/base.json';
        eslintConfigImport = '@repo/eslint-config/library';
        break;
      default:
        packageTypeLabel = 'Custom Library';
        tsConfigExtends = '@repo/typescript-config/base.json';
        eslintConfigImport = '@repo/eslint-config/library';
        break;
    }
    
    console.log(`\nConfiguring as a ${packageTypeLabel}...`);
    
    // Ask which monorepo packages to include
    return new Promise((resolve) => {
      rl.question('\nWhich monorepo packages would you like to include? (comma-separated, leave empty for none)\nAvailable packages: logger, config-typescript, config-eslint\n', (packagesInput) => {
        const selectedPackages = packagesInput.split(',').map(p => p.trim()).filter(Boolean);
        resolve({ packageType, packageTypeLabel, tsConfigExtends, eslintConfigImport, isUILibrary, selectedPackages });
      });
    });
  }).then(({ packageType, packageTypeLabel, tsConfigExtends, eslintConfigImport, isUILibrary, selectedPackages }) => {
    // Handle package.json
    const packageJsonPath = path.join(targetDir, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      // Backup original package.json
      const backupPackageJsonPath = path.join(targetDir, 'package.json-old');
      fs.copyFileSync(packageJsonPath, backupPackageJsonPath);
      console.log(`Backed up original package.json to package.json-old`);
      
      // Read the original package.json
      const originalPackageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      // Create a new package.json with monorepo configuration
      const newPackageJson = {
        name: `@repo/${name}`,
        version: originalPackageJson.version || "0.0.0",
        private: true,
        main: originalPackageJson.main || "./dist/index.js",
        module: originalPackageJson.module || "./dist/index.mjs",
        types: originalPackageJson.types || "./dist/index.d.ts",
        sideEffects: originalPackageJson.sideEffects || false,
        license: originalPackageJson.license || "MIT",
        files: originalPackageJson.files || ["dist/**"],
        scripts: {
          ...(originalPackageJson.scripts || {}),
          "check-types": "tsc --noEmit"
        },
        dependencies: {
          ...(originalPackageJson.dependencies || {})
        },
        devDependencies: {
          ...(originalPackageJson.devDependencies || {}),
          "@repo/eslint-config": "*",
          "@repo/typescript-config": "*"
        }
      };
      
      // Add selected monorepo packages
      if (selectedPackages.includes('logger')) {
        newPackageJson.dependencies["@repo/logger"] = "*";
      }
      
      // Add UI-specific configurations
      if (isUILibrary) {
        newPackageJson.peerDependencies = {
          ...(originalPackageJson.peerDependencies || {}),
          "@types/react": ">=18",
          "@types/react-dom": ">=18",
          "react": ">=18",
          "react-dom": ">=18"
        };
        
        // Add React types to devDependencies if not already there
        if (!newPackageJson.devDependencies["@types/react"]) {
          newPackageJson.devDependencies["@types/react"] = "^18.3.18";
        }
        if (!newPackageJson.devDependencies["@types/react-dom"]) {
          newPackageJson.devDependencies["@types/react-dom"] = "^18.3.5";
        }
      }
      
      // Clean up undefined properties
      Object.keys(newPackageJson).forEach(key => {
        if (newPackageJson[key] === undefined) {
          delete newPackageJson[key];
        }
      });
      
      // Save the new package.json
      fs.writeFileSync(packageJsonPath, JSON.stringify(newPackageJson, null, 2));
      console.log(`Updated package.json with monorepo configuration.`);
    }
    
    // Handle tsconfig.json
    const tsconfigPath = path.join(targetDir, 'tsconfig.json');
    if (fs.existsSync(tsconfigPath)) {
      // Backup original tsconfig.json
      const backupTsconfigPath = path.join(targetDir, 'tsconfig.json-old');
      fs.copyFileSync(tsconfigPath, backupTsconfigPath);
      console.log(`Backed up original tsconfig.json to tsconfig.json-old`);
      
      // Create a new tsconfig.json with monorepo configuration
      const tsConfig = {
        extends: tsConfigExtends,
        compilerOptions: isUILibrary ? {
          lib: ["dom", "ES2015"],
          sourceMap: true,
          types: ["bun", "node"]
        } : {},
        include: isUILibrary ? ["."] : ["src"],
        exclude: ["dist", "build", "node_modules"]
      };
      
      // Save the new tsconfig.json
      fs.writeFileSync(tsconfigPath, JSON.stringify(tsConfig, null, 2));
      console.log(`Updated tsconfig.json with monorepo configuration.`);
    }
    
    // Handle eslint configuration
    const eslintConfigPath = path.join(targetDir, '.eslintrc.js');
    const eslintConfigJsonPath = path.join(targetDir, '.eslintrc.json');
    const eslintConfigYamlPath = path.join(targetDir, '.eslintrc.yaml');
    const eslintConfigYmlPath = path.join(targetDir, '.eslintrc.yml');
    const eslintrcPath = path.join(targetDir, '.eslintrc');
    const newEslintConfigPath = path.join(targetDir, 'eslint.config.js');
    
    // Check for any existing eslint config files
    const eslintPaths = [
      eslintConfigPath, 
      eslintConfigJsonPath, 
      eslintConfigYamlPath, 
      eslintConfigYmlPath, 
      eslintrcPath
    ];
    
    let foundEslintConfig = false;
    
    for (const configPath of eslintPaths) {
      if (fs.existsSync(configPath)) {
        // Backup original eslint config
        const backupPath = `${configPath}-old`;
        fs.copyFileSync(configPath, backupPath);
        console.log(`Backed up original eslint config to ${path.basename(backupPath)}`);
        foundEslintConfig = true;
      }
    }
    
    // Create a new eslint.config.js with monorepo configuration
    const eslintConfig = `import { config } from "${eslintConfigImport}";

/** @type {import("eslint").Linter.Config} */
export default config;`;
    
    fs.writeFileSync(newEslintConfigPath, eslintConfig);
    console.log(`Created eslint.config.js with monorepo configuration.`);
    
    // Create turbo.json if it doesn't exist
    const turboJsonPath = path.join(targetDir, 'turbo.json');
    if (fs.existsSync(turboJsonPath)) {
      // Backup original turbo.json
      const backupTurboJsonPath = path.join(targetDir, 'turbo.json-old');
      fs.copyFileSync(turboJsonPath, backupTurboJsonPath);
      console.log(`Backed up original turbo.json to turbo.json-old`);
    }
    
    // Create a new turbo.json with monorepo configuration
    const turboConfig = {
      extends: ["//"],
      tasks: {
        build: {
          outputs: ["dist/**"]
        }
      }
    };
    
    fs.writeFileSync(turboJsonPath, JSON.stringify(turboConfig, null, 2));
    console.log(`Updated turbo.json with monorepo configuration.`);
    
    console.log(`\n✅ Successfully created package from git repository: ${name}`);
    console.log(`\nOriginal configuration files have been preserved with a -old suffix.`);
    console.log(`You may need to manually merge some configurations if the automatic conversion missed anything.`);
    
    // Print next steps
    console.log('\n🎉 Done! Happy coding!');
    console.log('\nNext steps:');
    console.log(`1. cd packages/${name}`);
    console.log('2. bun install');
    console.log('3. Review and update configuration files as needed');
    console.log('4. cd ../../');
    console.log('5. bun dev');
    
    // Close the readline interface
    rl.close();
  });
}

// Function to create a Next.js app
function createNextApp(name) {
  const appDir = path.join(process.cwd(), 'apps', name);
  
  // Create basic directory structure
  createDirectoryIfNotExists(appDir);
  createDirectoryIfNotExists(path.join(appDir, 'src'));
  createDirectoryIfNotExists(path.join(appDir, 'public'));
  createDirectoryIfNotExists(path.join(appDir, 'src', 'app'));
  
  // Create package.json
  const packageJson = {
    name,
    version: "0.0.0",
    type: "module",
    private: true,
    scripts: {
      build: "next build",
      dev: "next dev",
      lint: "next lint",
      "check-types": "tsc --noEmit",
      start: "next start"
    },
    dependencies: {
      "@repo/logger": "*",
      "@repo/ui": "*",
      "next": "^15.1.6",
      "react": "^19.0.0",
      "react-dom": "^19.0.0"
    },
    devDependencies: {
      "@next/eslint-plugin-next": "^15.1.6",
      "@repo/eslint-config": "*",
      "@repo/typescript-config": "*",
      "@types/node": "^22.12.0",
      "@types/react": "^19",
      "@types/react-dom": "^19",
      "eslint": "^9.21.0",
      "typescript": "5.7.3",
      "postcss": "^8.4.49",
      "tailwindcss": "^3.4.1"
    }
  };
  
  createFile(
    path.join(appDir, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );
  
  // Create tsconfig.json
  const tsConfig = {
    exclude: ["node_modules"],
    extends: "@repo/typescript-config/nextjs.json",
    compilerOptions: {
      outDir: "dist",
      plugins: [
        {
          name: "next"
        }
      ],
      baseUrl: ".",
      paths: {
        "@/*": ["./src/*"]
      }
    },
    include: ["src", "next.config.ts", "next-env.d.ts", ".next/types/**/*.ts"]
  };
  
  createFile(
    path.join(appDir, 'tsconfig.json'),
    JSON.stringify(tsConfig, null, 2)
  );
  
  // Create next.config.ts
  const nextConfig = `
import { withTurbo } from "turbo/next";

/** @type {import('next').NextConfig} */
export default withTurbo({
  reactStrictMode: true,
  transpilePackages: ["@repo/ui"],
  eslint: {
    ignoreDuringBuilds: true,
  },
});
`;
  
  createFile(path.join(appDir, 'next.config.ts'), nextConfig);
  
  // Create eslint.config.js
  const eslintConfig = `import { config } from "@repo/eslint-config/next";

/** @type {import("eslint").Linter.Config} */
export default config;
`;
  
  createFile(path.join(appDir, 'eslint.config.js'), eslintConfig);
  
  // Create turbo.json
  const turboConfig = {
    extends: ["//"],
    tasks: {
      build: {
        outputs: [".next/**", "!.next/cache/**"]
      }
    }
  };
  
  createFile(
    path.join(appDir, 'turbo.json'),
    JSON.stringify(turboConfig, null, 2)
  );
  
  // Create a basic README.md
  const readme = `# ${name}

This is a [Next.js](https://nextjs.org/) app in the monorepo.

## Getting Started

First, run the development server:

\`\`\`bash
cd ../../
bun dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
`;
  
  createFile(path.join(appDir, 'README.md'), readme);
  
  // Create a basic index page
  const indexPage = `export default function Page() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">Welcome to ${name}</h1>
      <p className="mt-4 text-xl">
        Get started by editing <code className="font-mono">src/app/page.tsx</code>
      </p>
    </div>
  );
}
`;
  
  createFile(path.join(appDir, 'src', 'app', 'page.tsx'), indexPage);
  
  // Create layout.tsx
  const layoutFile = `import "./globals.css";

export const metadata = {
  title: '${name}',
  description: 'Created with turborepo',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
`;
  
  createFile(path.join(appDir, 'src', 'app', 'layout.tsx'), layoutFile);
  
  // Create globals.css
  const globalCss = `@tailwind base;
@tailwind components;
@tailwind utilities;
`;
  
  createFile(path.join(appDir, 'src', 'app', 'globals.css'), globalCss);
  
  // Create tailwind.config.ts
  const tailwindConfig = `import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
`;
  
  createFile(path.join(appDir, 'tailwind.config.ts'), tailwindConfig);
  
  // Create postcss.config.mjs
  const postcssConfig = `/** @type {import('postcss').Config} */
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

export default config;
`;
  
  createFile(path.join(appDir, 'postcss.config.mjs'), postcssConfig);
  
  console.log(`\n✅ Successfully created Next.js app: ${name}`);
}

// Function to create a React app
function createReactApp(name) {
  const appDir = path.join(process.cwd(), 'apps', name);
  
  // Create basic directory structure
  createDirectoryIfNotExists(appDir);
  createDirectoryIfNotExists(path.join(appDir, 'src'));
  createDirectoryIfNotExists(path.join(appDir, 'public'));
  
  // Create package.json
  const packageJson = {
    name,
    version: "0.0.0",
    private: true,
    type: "module",
    scripts: {
      build: "vite build",
      dev: "vite",
      lint: "eslint src/",
      preview: "vite preview",
      "check-types": "tsc --noEmit"
    },
    dependencies: {
      "@repo/ui": "*",
      "react": "^19.0.0",
      "react-dom": "^19.0.0"
    },
    devDependencies: {
      "@repo/eslint-config": "*",
      "@repo/typescript-config": "*",
      "@types/react": "^19",
      "@types/react-dom": "^19",
      "@vitejs/plugin-react": "^4.2.1",
      "eslint": "^9.21.0",
      "typescript": "5.7.3",
      "vite": "^5.1.4"
    }
  };
  
  createFile(
    path.join(appDir, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );
  
  // Create tsconfig.json
  const tsConfig = {
    extends: "@repo/typescript-config/react-app.json",
    compilerOptions: {
      baseUrl: ".",
      paths: {
        "@/*": ["./src/*"]
      }
    },
    include: ["src"],
    exclude: ["node_modules", "dist"]
  };
  
  createFile(
    path.join(appDir, 'tsconfig.json'),
    JSON.stringify(tsConfig, null, 2)
  );
  
  // Create eslint.config.js
  const eslintConfig = `import { config } from "@repo/eslint-config/react";

/** @type {import("eslint").Linter.Config} */
export default config;
`;
  
  createFile(path.join(appDir, 'eslint.config.js'), eslintConfig);
  
  // Create vite.config.ts
  const viteConfig = `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
`;
  
  createFile(path.join(appDir, 'vite.config.ts'), viteConfig);
  
  // Create turbo.json
  const turboConfig = {
    extends: ["//"],
    tasks: {
      build: {
        outputs: ["dist/**"]
      }
    }
  };
  
  createFile(
    path.join(appDir, 'turbo.json'),
    JSON.stringify(turboConfig, null, 2)
  );
  
  // Create index.html
  const indexHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${name}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`;
  
  createFile(path.join(appDir, 'index.html'), indexHtml);
  
  // Create main.tsx
  const mainTsx = `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`;
  
  createFile(path.join(appDir, 'src', 'main.tsx'), mainTsx);
  
  // Create App.tsx
  const appTsx = `import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to ${name}</h1>
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
      </header>
    </div>
  );
}

export default App;
`;
  
  createFile(path.join(appDir, 'src', 'App.tsx'), appTsx);
  
  // Create App.css
  const appCss = `.App {
  text-align: center;
}

.App-header {
  background-color: #282c34;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: calc(10px + 2vmin);
  color: white;
}
`;
  
  createFile(path.join(appDir, 'src', 'App.css'), appCss);
  
  // Create index.css
  const indexCss = `:root {
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;
}

body {
  margin: 0;
  display: flex;
  place-items: center;
  min-width: 320px;
  min-height: 100vh;
}
`;
  
  createFile(path.join(appDir, 'src', 'index.css'), indexCss);
  
  console.log(`\n✅ Successfully created React app: ${name}`);
}

// Function to create a UI component library
function createUILibrary(name) {
  const packageDir = path.join(process.cwd(), 'packages', name);
  
  // Create basic directory structure
  createDirectoryIfNotExists(packageDir);
  createDirectoryIfNotExists(path.join(packageDir, 'src'));
  
  // Create package.json
  const packageJson = {
    name: `@repo/${name}`,
    version: "0.0.0",
    private: true,
    license: "MIT",
    sideEffects: false,
    files: [
      "dist/**",
      "dist"
    ],
    exports: {
      "./button": {
        "import": {
          "types": "./dist/es/button.d.mts",
          "default": "./dist/es/button.mjs"
        },
        "require": {
          "types": "./dist/cjs/button.d.ts",
          "default": "./dist/cjs/button.js"
        }
      }
    },
    scripts: {
      build: "bunchee",
      dev: "bunchee --watch",
      "check-types": "tsc --noEmit",
      lint: "eslint src/",
      test: "bun test --preload @repo/bun-test-presets --timeout 10000"
    },
    devDependencies: {
      "@repo/bun-test-presets": "*",
      "@repo/eslint-config": "*",
      "@repo/typescript-config": "*",
      "@types/node": "^22.12.0",
      "@types/react": "^18.3.18",
      "@types/react-dom": "^18.3.5",
      "bunchee": "^6.4.0",
      "eslint": "^9.21.0",
      "happy-dom": "^12.10.3",
      "typescript": "5.7.3"
    },
    peerDependencies: {
      "@types/react": ">=18",
      "@types/react-dom": ">=18",
      "react": ">=18",
      "react-dom": ">=18"
    }
  };
  
  createFile(
    path.join(packageDir, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );
  
  // Create tsconfig.json
  const tsConfig = {
    extends: "@repo/typescript-config/react-library.json",
    compilerOptions: {
      lib: ["dom", "ES2015"],
      sourceMap: true,
      types: ["bun", "node"]
    },
    include: ["."],
    exclude: ["dist", "build", "node_modules"]
  };
  
  createFile(
    path.join(packageDir, 'tsconfig.json'),
    JSON.stringify(tsConfig, null, 2)
  );
  
  // Create eslint.config.js
  const eslintConfig = `import { config } from "@repo/eslint-config/library";

/** @type {import("eslint").Linter.Config} */
export default config;
`;
  
  createFile(path.join(packageDir, 'eslint.config.js'), eslintConfig);
  
  // Create turbo.json
  const turboConfig = {
    extends: ["//"],
    tasks: {
      build: {
        outputs: ["dist/**"]
      }
    }
  };
  
  createFile(
    path.join(packageDir, 'turbo.json'),
    JSON.stringify(turboConfig, null, 2)
  );
  
  // Create a basic Button component
  const buttonComponent = `import * as React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function Button({ children, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      style={{
        padding: "10px 15px",
        borderRadius: "4px",
        backgroundColor: "#0070f3",
        color: "white",
        border: "none",
        cursor: "pointer",
        ...props.style,
      }}
    >
      {children}
    </button>
  );
}

Button.displayName = "Button";
`;
  
  createFile(path.join(packageDir, 'src', 'button.tsx'), buttonComponent);
  
  console.log(`\n✅ Successfully created UI library: ${name}`);
}

// Function to create a utility library
function createUtilityLibrary(name) {
  const packageDir = path.join(process.cwd(), 'packages', name);
  
  // Create basic directory structure
  createDirectoryIfNotExists(packageDir);
  createDirectoryIfNotExists(path.join(packageDir, 'src'));
  
  // Create package.json
  const packageJson = {
    name: `@repo/${name}`,
    version: "0.0.0",
    private: true,
    main: "./dist/index.js",
    module: "./dist/index.mjs",
    types: "./dist/index.d.ts",
    sideEffects: false,
    license: "MIT",
    files: ["dist/**"],
    scripts: {
      build: "tsup src/index.ts --format esm,cjs --dts",
      dev: "tsup src/index.ts --format esm,cjs --watch --dts",
      lint: "eslint src/",
      clean: "rm -rf .turbo && rm -rf node_modules && rm -rf dist",
      "check-types": "tsc --noEmit",
      test: "bun test --preload @repo/bun-test-presets"
    },
    devDependencies: {
      "@repo/bun-test-presets": "*",
      "@repo/eslint-config": "*",
      "@repo/typescript-config": "*",
      "@types/node": "^22.12.0",
      "eslint": "^9.21.0",
      "tsup": "^8.0.1",
      "typescript": "5.7.3"
    }
  };
  
  createFile(
    path.join(packageDir, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );
  
  // Create tsconfig.json
  const tsConfig = {
    extends: "@repo/typescript-config/base.json",
    include: ["src"],
    exclude: ["node_modules", "dist"]
  };
  
  createFile(
    path.join(packageDir, 'tsconfig.json'),
    JSON.stringify(tsConfig, null, 2)
  );
  
  // Create eslint.config.js
  const eslintConfig = `import { config } from "@repo/eslint-config/library";

/** @type {import("eslint").Linter.Config} */
export default config;
`;
  
  createFile(path.join(packageDir, 'eslint.config.js'), eslintConfig);
  
  // Create turbo.json
  const turboConfig = {
    extends: ["//"],
    tasks: {
      build: {
        outputs: ["dist/**"]
      }
    }
  };
  
  createFile(
    path.join(packageDir, 'turbo.json'),
    JSON.stringify(turboConfig, null, 2)
  );
  
  // Create a basic index.ts file
  const indexFile = `/**
 * ${name} package
 * @packageDocumentation
 */

/**
 * A simple utility function that returns a greeting
 * @param name - The name to greet
 * @returns A greeting message
 */
export function greet(name: string): string {
  return \`Hello, \${name}!\`;
}

/**
 * A utility function to format a date
 * @param date - The date to format
 * @returns A formatted date string
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}
`;
  
  createFile(path.join(packageDir, 'src', 'index.ts'), indexFile);
  
  // Create a test file
  const testFile = `import { describe, expect, it } from "bun:test";
import { greet, formatDate } from "./index";

describe("${name}", () => {
  it("should greet correctly", () => {
    expect(greet("World")).toBe("Hello, World!");
  });

  it("should format date correctly", () => {
    const date = new Date(2023, 0, 1); // January 1, 2023
    expect(formatDate(date)).toContain("January 1, 2023");
  });
});
`;
  
  createFile(path.join(packageDir, 'src', 'index.test.ts'), testFile);
  
  console.log(`\n✅ Successfully created utility library: ${name}`);
}

// Function to create an ElysiaJS app
function createElysiaApp(name) {
  const appDir = path.join(process.cwd(), 'apps', name);
  
  // Create basic directory structure
  createDirectoryIfNotExists(appDir);
  createDirectoryIfNotExists(path.join(appDir, 'src'));
  createDirectoryIfNotExists(path.join(appDir, 'src', 'routes'));
  
  // Create package.json
  const packageJson = {
    name,
    version: "0.0.0",
    type: "module",
    private: true,
    scripts: {
      build: "bun build ./src/index.ts --outdir ./dist --target bun",
      dev: "bun --watch src/index.ts",
      start: "bun src/index.ts",
      lint: "eslint src/",
      "check-types": "tsc --noEmit",
      test: "bun test --preload @repo/bun-test-presets"
    },
    dependencies: {
      "@repo/logger": "*",
      "elysia": "^1.0.0"
    },
    devDependencies: {
      "@repo/bun-test-presets": "*",
      "@repo/eslint-config": "*",
      "@repo/typescript-config": "*",
      "@types/node": "^22.12.0",
      "eslint": "^9.21.0",
      "typescript": "5.7.3"
    }
  };
  
  createFile(
    path.join(appDir, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );
  
  // Create tsconfig.json
  const tsConfig = {
    extends: "@repo/typescript-config/base.json",
    compilerOptions: {
      outDir: "dist",
      baseUrl: ".",
      paths: {
        "@/*": ["./src/*"]
      }
    },
    include: ["src"],
    exclude: ["node_modules", "dist"]
  };
  
  createFile(
    path.join(appDir, 'tsconfig.json'),
    JSON.stringify(tsConfig, null, 2)
  );
  
  // Create eslint.config.js
  const eslintConfig = `import { config } from "@repo/eslint-config/base";

/** @type {import("eslint").Linter.Config} */
export default config;
`;
  
  createFile(path.join(appDir, 'eslint.config.js'), eslintConfig);
  
  // Create turbo.json
  const turboConfig = {
    extends: ["//"],
    tasks: {
      build: {
        outputs: ["dist/**"]
      }
    }
  };
  
  createFile(
    path.join(appDir, 'turbo.json'),
    JSON.stringify(turboConfig, null, 2)
  );
  
  // Create a routes/index.ts file
  const routesIndexFile = `import { Elysia } from 'elysia';

export const rootRouter = new Elysia({ prefix: '/api' })
  .get('/', () => ({ 
    message: 'Hello, Elysia!',
    version: '1.0.0'
  }))
  .get('/ping', () => 'pong');
`;
  
  createFile(path.join(appDir, 'src', 'routes', 'index.ts'), routesIndexFile);
  
  // Create a basic index.ts file
  const indexFile = `import { Elysia } from 'elysia';
import { rootRouter } from './routes';

const app = new Elysia()
  .use(rootRouter)
  .listen(3000);

console.log(\`🦊 Elysia server is running at \${app.server?.hostname}:\${app.server?.port}\`);

export type App = typeof app;
`;
  
  createFile(path.join(appDir, 'src', 'index.ts'), indexFile);
  
  // Create a test file
  const testFile = `import { describe, expect, it } from "bun:test";
import { Elysia } from "elysia";
import { rootRouter } from "./routes";

describe("API Endpoints", () => {
  const app = new Elysia().use(rootRouter);

  it("should return hello message", async () => {
    const response = await app.handle(
      new Request("http://localhost/api")
    ).then(res => res.json());
    
    expect(response).toHaveProperty("message");
    expect(response.message).toBe("Hello, Elysia!");
  });

  it("should return pong", async () => {
    const response = await app.handle(
      new Request("http://localhost/api/ping")
    ).then(res => res.text());
    
    expect(response).toBe("pong");
  });
});
`;
  
  createFile(path.join(appDir, 'src', 'index.test.ts'), testFile);
  
  // Create a basic README.md
  const readme = `# ${name}

This is an [ElysiaJS](https://elysiajs.com/) app in the monorepo.

## Getting Started

First, run the development server:

\`\`\`bash
cd ../../
bun dev
\`\`\`

Or to run just this app:

\`\`\`bash
cd apps/${name}
bun dev
\`\`\`

Open [http://localhost:3000/api](http://localhost:3000/api) with your browser to see the result.

## Testing

Run tests with:

\`\`\`bash
bun test
\`\`\`

## Learn More

To learn more about Elysia, take a look at the following resources:

- [Elysia Documentation](https://elysiajs.com/docs) - learn about Elysia features and API.
- [Elysia GitHub](https://github.com/elysiajs/elysia) - check out the Elysia repository.
`;
  
  createFile(path.join(appDir, 'README.md'), readme);
  
  console.log(`\n✅ Successfully created ElysiaJS app: ${name}`);
}

// Function to create an ElysiaJS app using 'bun create elysia'
function createElysiaAppFromTemplate(name) {
  const appDir = path.join(process.cwd(), 'apps', name);
  const tempDir = path.join(process.cwd(), 'temp-elysia-app');
  
  console.log(`\nCreating temporary Elysia app with 'bun create elysia'...`);
  
  try {
    // Create a temporary directory for the Elysia app
    createDirectoryIfNotExists(tempDir);
    
    // Run 'bun create elysia' in the temporary directory
    execSync(`cd ${tempDir} && bun create elysia .`, { stdio: 'inherit' });
    
    // Create the target directory
    createDirectoryIfNotExists(appDir);
    createDirectoryIfNotExists(path.join(appDir, 'src', 'routes'));
    
    // Copy files from the temporary directory to the target directory
    const files = fs.readdirSync(tempDir);
    for (const file of files) {
      if (file !== 'node_modules' && file !== '.git') {
        const sourcePath = path.join(tempDir, file);
        const destPath = path.join(appDir, file);
        
        if (fs.statSync(sourcePath).isDirectory()) {
          // Copy directory recursively
          fs.cpSync(sourcePath, destPath, { recursive: true });
          console.log(`Copied directory: ${file}`);
        } else {
          // Copy file
          fs.copyFileSync(sourcePath, destPath);
          console.log(`Copied file: ${file}`);
        }
      }
    }
    
    // Update package.json to fit into the monorepo
    const packageJsonPath = path.join(appDir, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      try {
        const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf8');
        const packageJson = JSON.parse(packageJsonContent);
        
        // Update package.json
        packageJson.name = name;
        packageJson.private = true;
        
        // Add monorepo dependencies
        packageJson.devDependencies = {
          ...(packageJson.devDependencies || {}),
          "@repo/eslint-config": "*",
          "@repo/typescript-config": "*",
          "@repo/bun-test-presets": "*"
        };
        
        packageJson.dependencies = {
          ...(packageJson.dependencies || {}),
          "@repo/logger": "*"
        };
        
        // Add check-types script and test script
        packageJson.scripts = {
          ...(packageJson.scripts || {}),
          "check-types": "tsc --noEmit",
          "test": "bun test --preload @repo/bun-test-presets"
        };
        
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
        console.log(`Updated package.json with monorepo configuration.`);
      } catch (error) {
        console.error(`Error updating package.json: ${error.message}`);
        console.log('Creating a new package.json file instead...');
        
        // Create a new package.json if parsing fails
        const packageJson = {
          name,
          version: "0.0.0",
          type: "module",
          private: true,
          scripts: {
            build: "bun build ./src/index.ts --outdir ./dist --target bun",
            dev: "bun --watch src/index.ts",
            start: "bun src/index.ts",
            lint: "eslint src/",
            "check-types": "tsc --noEmit",
            "test": "bun test --preload @repo/bun-test-presets"
          },
          dependencies: {
            "@repo/logger": "*",
            "elysia": "^1.0.0"
          },
          devDependencies: {
            "@repo/bun-test-presets": "*",
            "@repo/eslint-config": "*",
            "@repo/typescript-config": "*",
            "@types/node": "^22.12.0",
            "eslint": "^9.21.0",
            "typescript": "5.7.3"
          }
        };
        
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
        console.log(`Created new package.json with monorepo configuration.`);
      }
    }
    
    // Create or update tsconfig.json
    const tsconfigPath = path.join(appDir, 'tsconfig.json');
    if (fs.existsSync(tsconfigPath)) {
      // Backup original tsconfig.json
      const backupTsconfigPath = path.join(appDir, 'tsconfig.json-old');
      fs.copyFileSync(tsconfigPath, backupTsconfigPath);
      console.log(`Backed up original tsconfig.json to tsconfig.json-old`);
      
      try {
        // Try to read and parse the tsconfig.json file
        const tsconfigContent = fs.readFileSync(tsconfigPath, 'utf8');
        
        // Remove comments from the JSON before parsing
        const tsconfigWithoutComments = tsconfigContent.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
        const originalTsConfig = JSON.parse(tsconfigWithoutComments);
        
        // Create a new tsconfig.json with monorepo configuration
        const tsConfig = {
          extends: "@repo/typescript-config/base.json",
          compilerOptions: {
            ...(originalTsConfig.compilerOptions || {}),
            outDir: "dist",
            baseUrl: ".",
            paths: {
              "@/*": ["./src/*"]
            }
          },
          include: originalTsConfig.include || ["src"],
          exclude: originalTsConfig.exclude || ["node_modules", "dist"]
        };
        
        fs.writeFileSync(tsconfigPath, JSON.stringify(tsConfig, null, 2));
        console.log(`Updated tsconfig.json with monorepo configuration.`);
      } catch (error) {
        console.error(`Error parsing tsconfig.json: ${error.message}`);
        console.log('Creating a new tsconfig.json file instead...');
        
        // Create a new tsconfig.json if parsing fails
        const tsConfig = {
          extends: "@repo/typescript-config/base.json",
          compilerOptions: {
            outDir: "dist",
            baseUrl: ".",
            paths: {
              "@/*": ["./src/*"]
            }
          },
          include: ["src"],
          exclude: ["node_modules", "dist"]
        };
        
        fs.writeFileSync(tsconfigPath, JSON.stringify(tsConfig, null, 2));
        console.log(`Created new tsconfig.json with monorepo configuration.`);
      }
    } else {
      // Create a new tsconfig.json
      const tsConfig = {
        extends: "@repo/typescript-config/base.json",
        compilerOptions: {
          outDir: "dist",
          baseUrl: ".",
          paths: {
            "@/*": ["./src/*"]
          }
        },
        include: ["src"],
        exclude: ["node_modules", "dist"]
      };
      
      createFile(
        path.join(appDir, 'tsconfig.json'),
        JSON.stringify(tsConfig, null, 2)
      );
    }
    
    // Create eslint.config.js
    const eslintConfig = `import { config } from "@repo/eslint-config/base";

/** @type {import("eslint").Linter.Config} */
export default config;
`;
    
    createFile(path.join(appDir, 'eslint.config.js'), eslintConfig);
    
    // Create turbo.json
    const turboConfig = {
      extends: ["//"],
        tasks: {
        build: {
          outputs: ["dist/**"]
        }
      }
    };
    
    createFile(
      path.join(appDir, 'turbo.json'),
      JSON.stringify(turboConfig, null, 2)
    );
    
    // Check if we need to create a routes directory and move code
    const indexPath = path.join(appDir, 'src', 'index.ts');
    if (fs.existsSync(indexPath)) {
      try {
        const indexContent = fs.readFileSync(indexPath, 'utf8');
        
        // If the index file has route definitions, extract them to a routes file
        if (indexContent.includes('.get(') || indexContent.includes('.post(') || 
            indexContent.includes('.put(') || indexContent.includes('.delete(')) {
          
          // Create routes/index.ts file
          const routesIndexFile = `import { Elysia } from 'elysia';

export const rootRouter = new Elysia({ prefix: '/api' })
  .get('/', () => ({ 
    message: 'Hello, Elysia!',
    version: '1.0.0'
  }))
  .get('/ping', () => 'pong');
`;
          
          createFile(path.join(appDir, 'src', 'routes', 'index.ts'), routesIndexFile);
          
          // Update the main index.ts file
          const newIndexFile = `import { Elysia } from 'elysia';
import { rootRouter } from './routes';

const app = new Elysia()
  .use(rootRouter)
  .listen(3000);

console.log(\`🦊 Elysia server is running at \${app.server?.hostname}:\${app.server?.port}\`);

export type App = typeof app;
`;
          
          fs.writeFileSync(indexPath, newIndexFile);
          console.log(`Updated index.ts to use routes directory.`);
        }
      } catch (error) {
        console.error(`Error updating index.ts: ${error.message}`);
      }
    }
    
    // Create a test file
    const testFile = `import { describe, expect, it } from "bun:test";
import { Elysia } from "elysia";
import { rootRouter } from "./routes";

describe("API Endpoints", () => {
  const app = new Elysia().use(rootRouter);

  it("should return hello message", async () => {
    const response = await app.handle(
      new Request("http://localhost/api")
    ).then(res => res.json());
    
    expect(response).toHaveProperty("message");
    expect(response.message).toBe("Hello, Elysia!");
  });

  it("should return pong", async () => {
    const response = await app.handle(
      new Request("http://localhost/api/ping")
    ).then(res => res.text());
    
    expect(response).toBe("pong");
  });
});
`;
    
    createFile(path.join(appDir, 'src', 'index.test.ts'), testFile);
    
    // Update README.md to include testing information
    const readmePath = path.join(appDir, 'README.md');
    if (fs.existsSync(readmePath)) {
      try {
        let readmeContent = fs.readFileSync(readmePath, 'utf8');
        
        // Add testing section if it doesn't exist
        if (!readmeContent.includes('## Testing')) {
          readmeContent += `
## Testing

Run tests with:

\`\`\`bash
bun test
\`\`\`
`;
          fs.writeFileSync(readmePath, readmeContent);
          console.log(`Updated README.md with testing information.`);
        }
      } catch (error) {
        console.error(`Error updating README.md: ${error.message}`);
      }
    }
    
    // Clean up the temporary directory
    deleteDirectory(tempDir);
    
    console.log(`\n✅ Successfully created ElysiaJS app from template: ${name}`);
  } catch (error) {
    console.error(`\n❌ Failed to create ElysiaJS app from template: ${error.message}`);
    // Clean up if the directories were created
    deleteDirectory(tempDir);
    throw error;
  }
}

// Function to clone an existing workspace within the monorepo
function cloneWorkspace(name, sourceName, workspaceType) {
  const isApp = workspaceType === 'app';
  const baseDir = isApp ? 'apps' : 'packages';
  const sourceDir = path.join(process.cwd(), baseDir, sourceName);
  const targetDir = path.join(process.cwd(), baseDir, name);
  
  console.log(`\nCloning ${workspaceType} from ${sourceName} to ${name}...`);
  
  try {
    // Check if source workspace exists
    if (!fs.existsSync(sourceDir)) {
      throw new Error(`Source ${workspaceType} '${sourceName}' does not exist.`);
    }
    
    // Check if target workspace already exists
    if (fs.existsSync(targetDir)) {
      throw new Error(`Target ${workspaceType} '${name}' already exists.`);
    }
    
    // Create the target directory
    createDirectoryIfNotExists(targetDir);
    
    // Copy files from source to target
    const copyFiles = (source, target) => {
      const items = fs.readdirSync(source);
      
      for (const item of items) {
        const sourcePath = path.join(source, item);
        const targetPath = path.join(target, item);
        
        // Skip node_modules, .git, and dist directories
        if (item === 'node_modules' || item === '.git' || item === 'dist' || item === '.next') {
          continue;
        }
        
        const stats = fs.statSync(sourcePath);
        
        if (stats.isDirectory()) {
          // Create directory and copy contents recursively
          createDirectoryIfNotExists(targetPath);
          copyFiles(sourcePath, targetPath);
        } else {
          // Copy file
          fs.copyFileSync(sourcePath, targetPath);
          console.log(`Copied file: ${path.relative(process.cwd(), targetPath)}`);
        }
      }
    };
    
    // Copy all files from source to target
    copyFiles(sourceDir, targetDir);
    
    // Update package.json with the new name
    const packageJsonPath = path.join(targetDir, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      // Update name based on workspace type
      if (isApp) {
        packageJson.name = name;
      } else {
        packageJson.name = `@repo/${name}`;
      }
      
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      console.log(`Updated package.json with new name: ${packageJson.name}`);
    }
    
    console.log(`\n✅ Successfully cloned ${workspaceType} from ${sourceName} to ${name}`);
    
    // Print next steps
    console.log('\n🎉 Done! Happy coding!');
    console.log('\nNext steps:');
    console.log(`1. cd ${baseDir}/${name}`);
    console.log('2. bun install');
    console.log('3. Review and update configuration files as needed');
    console.log('4. cd ../../');
    console.log('5. bun dev');
    
  } catch (error) {
    console.error(`\n❌ Failed to clone ${workspaceType}: ${error.message}`);
    // Clean up if the directory was created
    if (fs.existsSync(targetDir)) {
      deleteDirectory(targetDir);
    }
    throw error;
  }
}

// Main function
async function main() {
  console.log('🚀 Welcome to the Turborepo Workspace Creator');
  console.log('------------------------------------------\n');
  
  rl.question('What do you want to create?\n1. Next.js App\n2. React App (Vite)\n3. UI Component Library\n4. Utility Library\n5. ElysiaJS App\n6. ElysiaJS App (from template)\n7. Import from Git Repository\n8. Clone Existing Workspace\nEnter choice (1-8): ', (type) => {
    if (!['1', '2', '3', '4', '5', '6', '7', '8'].includes(type)) {
      console.error('Invalid option. Please choose a number between 1 and 8.');
      rl.close();
      return;
    }
    
    const workspaceTypes = {
      '1': { type: 'Next.js App', fn: createNextApp, dir: 'apps' },
      '2': { type: 'React App', fn: createReactApp, dir: 'apps' },
      '3': { type: 'UI Component Library', fn: createUILibrary, dir: 'packages' },
      '4': { type: 'Utility Library', fn: createUtilityLibrary, dir: 'packages' },
      '5': { type: 'ElysiaJS App', fn: createElysiaApp, dir: 'apps' },
      '6': { type: 'ElysiaJS App (from template)', fn: createElysiaAppFromTemplate, dir: 'apps' },
      '7': { type: 'Import from Git', fn: null, dir: null }, // Special case
      '8': { type: 'Clone Existing', fn: null, dir: null }   // Special case
    };
    
    const selectedType = workspaceTypes[type];
    
    if (type === '7') {
      // Handle Git repository import
      rl.question('Is this an (a)pp or a (p)ackage? ', (workspaceTypeInput) => {
        const workspaceType = workspaceTypeInput.toLowerCase() === 'a' ? 'app' : 'package';
        const dir = workspaceType === 'app' ? 'apps' : 'packages';
        
        rl.question(`Enter the name for your new ${workspaceType}: `, (name) => {
          // Validate name
          if (!/^[a-z0-9-]+$/.test(name)) {
            console.error('Invalid name. Use only lowercase letters, numbers, and hyphens.');
            rl.close();
            return;
          }
          
          const dirPath = path.join(process.cwd(), dir, name);
          
          if (fs.existsSync(dirPath)) {
            console.error(`Error: A ${workspaceType} with the name "${name}" already exists.`);
            rl.close();
            return;
          }
          
          rl.question('Enter the Git repository URL: ', (repoUrl) => {
            console.log(`\nCreating ${workspaceType} from Git repository: ${name}`);
            
            try {
              createFromGitRepo(name, repoUrl, workspaceType);
            } catch (error) {
              console.error('An error occurred:', error);
              rl.close();
            }
          });
        });
      });
    } else if (type === '8') {
      // Handle cloning existing workspace
      rl.question('Is this an (a)pp or a (p)ackage? ', (workspaceTypeInput) => {
        const workspaceType = workspaceTypeInput.toLowerCase() === 'a' ? 'app' : 'package';
        const dir = workspaceType === 'app' ? 'apps' : 'packages';
        
        // List available workspaces to clone
        const workspaces = fs.readdirSync(path.join(process.cwd(), dir))
          .filter(item => {
            const itemPath = path.join(process.cwd(), dir, item);
            return fs.statSync(itemPath).isDirectory();
          });
        
        if (workspaces.length === 0) {
          console.error(`No ${workspaceType}s found to clone.`);
          rl.close();
          return;
        }
        
        console.log(`\nAvailable ${workspaceType}s to clone:`);
        workspaces.forEach((workspace, index) => {
          console.log(`${index + 1}. ${workspace}`);
        });
        
        rl.question(`\nSelect a ${workspaceType} to clone (1-${workspaces.length}): `, (sourceIndex) => {
          const index = parseInt(sourceIndex) - 1;
          
          if (isNaN(index) || index < 0 || index >= workspaces.length) {
            console.error(`Invalid selection. Please choose a number between 1 and ${workspaces.length}.`);
            rl.close();
            return;
          }
          
          const sourceName = workspaces[index];
          
          rl.question(`Enter the name for your new ${workspaceType} (cloned from ${sourceName}): `, (name) => {
            // Validate name
            if (!/^[a-z0-9-]+$/.test(name)) {
              console.error('Invalid name. Use only lowercase letters, numbers, and hyphens.');
              rl.close();
              return;
            }
            
            try {
              cloneWorkspace(name, sourceName, workspaceType);
              rl.close();
            } catch (error) {
              console.error('An error occurred:', error);
              rl.close();
            }
          });
        });
      });
    } else {
      // Handle regular template-based creation
      rl.question(`Enter the name for your new ${selectedType.type}: `, (name) => {
        // Validate name
        if (!/^[a-z0-9-]+$/.test(name)) {
          console.error('Invalid name. Use only lowercase letters, numbers, and hyphens.');
          rl.close();
          return;
        }
        
        const dirPath = path.join(process.cwd(), selectedType.dir, name);
        
        if (fs.existsSync(dirPath)) {
          console.error(`Error: A ${selectedType.type.toLowerCase()} with the name "${name}" already exists.`);
          rl.close();
          return;
        }
        
        console.log(`\nCreating ${selectedType.type}: ${name}...`);
        
        try {
          selectedType.fn(name);
          
          console.log('\n🎉 Done! Happy coding!');
          console.log('\nNext steps:');
          console.log(`1. cd ${selectedType.dir}/${name}`);
          console.log('2. bun install');
          console.log('3. cd ../../');
          console.log('4. bun dev');
          
          rl.close();
        } catch (error) {
          console.error('An error occurred:', error);
          rl.close();
        }
      });
    }
  });
}

// Run the script
main(); 