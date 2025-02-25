# Adding New Apps to a Turborepo Monorepo

This guide explains how to add new applications to your Turborepo monorepo based on the kitchen-sink example.

## Overview

Your monorepo is structured with:
- `apps/` directory for applications
- `packages/` directory for shared packages
- Workspaces configured in the root `package.json`
- Build pipeline configured in `turbo.json`

## Step-by-Step Process

### 1. Create a New App Directory

Create a new directory for your app in the `apps/` folder:

```bash
mkdir -p apps/my-new-app
```

### 2. Initialize the App

Navigate to your new app directory and create a `package.json` file:

```bash
cd apps/my-new-app
```

Create a `package.json` with the following structure:

```json
{
  "name": "my-new-app",
  "version": "0.0.0",
  "type": "module",
  "private": true,
  "scripts": {
    "build": "next build",
    "dev": "next dev -p 3003",
    "lint": "next lint",
    "check-types": "tsc --noEmit",
    "start": "next start"
  },
  "dependencies": {
    "@repo/logger": "*",
    "@repo/ui": "*",
    "next": "^15.1.6",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@next/eslint-plugin-next": "^15.1.6",
    "@repo/eslint-config": "*",
    "@repo/typescript-config": "*",
    "@types/node": "^22.12.0",
    "@types/react": "^18.3.18",
    "@types/react-dom": "^18.3.5",
    "eslint": "^9.21.0",
    "typescript": "5.7.3"
  }
}
```

> **Note**: Adjust the port number in the `dev` script to avoid conflicts with existing apps.

### 3. Create App-Specific Configuration Files

Create the following configuration files in your app directory:

#### `tsconfig.json`

```json
{
  "extends": "@repo/typescript-config/nextjs.json",
  "compilerOptions": {
    "plugins": [{ "name": "next" }]
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

#### `next.config.ts`

```typescript
import { defineConfig } from "next/config";

export default defineConfig({
  reactStrictMode: true,
  transpilePackages: ["@repo/ui"],
  // Add any other Next.js configuration options here
});
```

#### `eslint.config.js`

```javascript
import config from "@repo/eslint-config";
export default config;
```

#### `next-env.d.ts`

```typescript
/// <reference types="next" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/basic-features/typescript for more information.
```

#### `turbo.json` (optional, for app-specific pipeline configuration)

```json
{
  "extends": ["//"],
  "pipeline": {
    "build": {
      "outputs": [".next/**", "!.next/cache/**"]
    }
  }
}
```

### 4. Create Basic App Structure

Create the basic directory structure for your app:

```bash
mkdir -p src/app public
```

Create a minimal Next.js app:

#### `src/app/page.tsx`

```tsx
import { Button } from "@repo/ui";

export default function Page() {
  return (
    <div>
      <h1>My New App</h1>
      <Button>Click me</Button>
    </div>
  );
}
```

#### `src/app/layout.tsx`

```tsx
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
```

### 5. Install Dependencies

From the root of your monorepo, run:

```bash
bun install
```

This will install all dependencies and link your new app with the workspace.

### 6. Run Your New App

You can now run your new app using Turborepo:

```bash
# Run just your new app
bun turbo dev --filter=my-new-app

# Or run all apps
bun turbo dev
```

## Adding Different Types of Apps

### React App (Vite)

For a Vite-based React app, adjust the `package.json` scripts and dependencies:

```json
{
  "scripts": {
    "build": "vite build",
    "dev": "vite --port 3004",
    "lint": "eslint .",
    "check-types": "tsc --noEmit"
  },
  "dependencies": {
    "@repo/ui": "*",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@repo/eslint-config": "*",
    "@repo/typescript-config": "*",
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.2.8"
  }
}
```

### Express API

For an Express API app:

```json
{
  "scripts": {
    "build": "tsc",
    "dev": "ts-node-dev --respawn src/index.ts",
    "lint": "eslint .",
    "check-types": "tsc --noEmit"
  },
  "dependencies": {
    "@repo/logger": "*",
    "express": "^4.18.2"
  },
  "devDependencies": {
    "@repo/eslint-config": "*",
    "@repo/typescript-config": "*",
    "@types/express": "^4.17.21",
    "ts-node-dev": "^2.0.0"
  }
}
```

## Best Practices

1. **Consistent Naming**: Use consistent naming conventions across all apps
2. **Port Management**: Assign unique ports to each app to avoid conflicts
3. **Shared Dependencies**: Leverage shared packages from the `packages/` directory
4. **Configuration Inheritance**: Extend shared configurations when possible
5. **Pipeline Configuration**: Ensure your app's build, test, and lint scripts align with the monorepo's pipeline configuration

## Troubleshooting

- If your app isn't recognized in the workspace, ensure it's properly listed in the root `package.json` workspaces array
- Run `bun install` from the root after adding a new app to update dependencies
- Check for port conflicts if you can't start your app in development mode 