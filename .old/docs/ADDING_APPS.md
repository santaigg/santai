# Adding New Apps to the Turborepo Monorepo

This guide outlines the steps needed when adding a new application to the monorepo.

## Checklist

### 1. Package Structure
- [ ] Place the app in the `apps/` directory
- [ ] Ensure `package.json` has the following:
  - `private: true`
  - Correct name and version
  - Required scripts (dev, build, lint, etc.)
  - Dependencies on shared packages (e.g., `@repo/eslint-config`)

### 2. Scripts
Every app should implement these standard scripts:

- `dev`: Starts the development server
- `build`: Builds the app
- `lint`: Runs linting
- `check-types`: Runs type checking

### 3. Configuration Files
- [ ] TypeScript Configuration
  - Extend from shared configs when possible
  - Add app-specific compiler options as needed
  ```json
  {
    "extends": "@repo/typescript-config/base.json",
    "compilerOptions": {
      // App-specific options
    }
  }
  ```

- [ ] ESLint Configuration
  - Use shared configs
  - Add app-specific rules if needed
  ```javascript
  import { baseConfig } from "@repo/eslint-config/base";
  export default baseConfig;
  ```

### 4. Port Management
- [ ] Ensure the app uses a unique port
- [ ] Document the port in the root README.md
Current port assignments:
- Web: 3000
- Docs: 3001
- Backend: 3002
- API: 3003

### 5. Environment Variables
- [ ] Add any required env variables to:
  - `.env.example` (template)
  - Local `.env` file (actual values)
  - CI/CD configuration

### 6. Update Root Configuration
- [ ] Add new app to workspace in root `package.json`
- [ ] Update `turbo.json` if needed for app-specific pipeline configurations

### 7. Documentation
- [ ] Add app description to root README.md
- [ ] Create app-specific README.md
- [ ] Document integration points with other apps

## Common Issues

### Port Conflicts
If you experience port conflicts, ensure each app uses a unique port:
- Update the port in the app's configuration
- Document the new port assignment

### Build Dependencies
If your app depends on other workspace packages:
- Add them to `package.json` dependencies
- Ensure proper task dependencies in `turbo.json`

### Environment Variables
- Use `.env.example` for documentation
- Never commit sensitive values
- Configure CI/CD with required secrets

