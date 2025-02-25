# Turborepo Scripts

This directory contains utility scripts for managing the turborepo monorepo.

## Workspace Creator

The `create-workspace.js` script helps you quickly add new apps or packages to the monorepo with the correct configuration.

### Usage

Run the script using:

```bash
bun create
# or
npm run create
# or
yarn create
```

The script will guide you through an interactive process to create:

1. **Next.js App** - A Next.js application with proper configuration
2. **React App (Vite)** - A React application using Vite
3. **UI Component Library** - A React component library
4. **Utility Library** - A TypeScript utility library
5. **Import from Git Repository** - Import an existing project from a Git repository

### Features

- Creates all necessary files and directories
- Sets up proper TypeScript configuration
- Configures ESLint
- Sets up proper Turborepo pipeline configuration
- Creates basic starter files
- Imports existing projects from Git repositories
- Interactive configuration for imported repositories

### Git Repository Import

The Git repository import feature allows you to:

1. Clone an existing repository
2. Remove its `.git` directory to avoid nested git repositories
3. Interactively specify the type of app or package being imported
4. Choose which monorepo packages to include as dependencies
5. Backup original configuration files with a `-old` suffix
6. Create new configuration files properly set up for the monorepo
7. Preserve and merge dependencies from the original package.json

#### Interactive App Configuration

When importing an app, you'll be prompted to specify:
- **App Type**: Next.js, React (Vite), or Other
- **Dependencies**: Which monorepo packages to include (ui, logger, etc.)

Based on your selections, the script will:
- Configure the appropriate TypeScript settings
- Set up the correct ESLint configuration
- Configure Next.js settings (if applicable)
- Add the selected dependencies to package.json

#### Interactive Package Configuration

When importing a package, you'll be prompted to specify:
- **Package Type**: UI Component Library, Utility Library, or Other
- **Dependencies**: Which monorepo packages to include

Based on your selections, the script will:
- Configure the appropriate TypeScript settings
- Set up the correct ESLint configuration
- Add React peer dependencies (for UI libraries)
- Add the selected dependencies to package.json

This is useful when you want to:
- Import an existing project into your monorepo
- Start with a template or boilerplate from GitHub
- Migrate repositories into your monorepo structure

The script handles the following configuration files:
- `package.json` - Preserves dependencies while adding monorepo-specific configuration
- `tsconfig.json` - Sets up proper TypeScript configuration for the monorepo
- ESLint configuration - Creates a new `eslint.config.js` compatible with the monorepo
- `turbo.json` - Sets up proper Turborepo pipeline configuration
- Next.js configuration (for apps) - Creates a properly configured `next.config.ts`

All original configuration files are preserved with a `-old` suffix, making it easy to reference them if needed.

### Customization

You can modify the script to add more templates or customize the existing ones:

- Add new app types by creating new functions similar to `createNextApp`
- Modify the existing templates to match your project's needs
- Add more options to the interactive menu

### Troubleshooting

If you encounter any issues:

1. Make sure you have Node.js installed
2. Ensure you're running the script from the root of the monorepo
3. Check that the package names in the templates match your organization's naming convention
4. For Git imports, make sure you have Git installed and the repository URL is correct
5. After importing from Git, you may need to manually merge some configurations if the automatic conversion missed anything 

## Node Modules Cleanup

The `clean-node-modules.js` script helps you clean up all `node_modules` directories in the monorepo to free up disk space.

### Usage

Run the script using:

```bash
bun clean-modules
# or
npm run clean-modules
# or
yarn clean-modules
```

You can also run the script directly with options:

```bash
node scripts/clean-node-modules.js --help  # Show help information
node scripts/clean-node-modules.js         # Interactive mode with confirmation
node scripts/clean-node-modules.js --yes   # Skip confirmation and delete all directories
```

### Features

- Recursively finds all `node_modules` directories in the monorepo
- Excludes directories that start with a period (e.g., `.git`, `.next`)
- Shows the size of each `node_modules` directory
- Provides an interactive confirmation before deletion
- Reports success/failure for each directory
- Works on both Windows and Unix-like systems
- Supports command-line options for automation

### When to Use

This script is useful when:

1. You want to free up disk space
2. You're experiencing dependency issues and want a clean slate
3. You want to ensure all packages use the latest dependencies
4. You're preparing to commit or archive your project

After running this script, you'll need to run `bun install` (or your package manager's equivalent) to reinstall dependencies.

### Customization

You can modify the script to:

- Include or exclude specific directories
- Change the confirmation behavior
- Add additional cleanup steps 