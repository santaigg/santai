# Bun Test Presets

This package provides unified test setup for all packages in the monorepo.

## Features

- **DOM Environment**: Sets up a browser-like environment using `happy-dom` for testing React components
- **Global Test Setup**: Configures global test settings for all packages
- **Turborepo Integration**: Works with Turborepo's caching for faster test runs

## Usage

### Running Tests

To run tests in any package, you can use:

```bash
bun test --preload @repo/bun-test-presets --timeout 10000
```

From the root of the monorepo, you can run all tests with:

```bash
bun run test
```

This will use Turborepo to run all tests with proper caching, which means:
- Only tests for packages that have changed will be run
- Test results are cached for faster subsequent runs
- All tests use the same environment setup

### Package Configuration

Each package should configure its test script like this:

```json
{
  "scripts": {
    "test": "bun test --preload @repo/bun-test-presets --timeout 10000"
  },
  "devDependencies": {
    "@repo/bun-test-presets": "*"
  }
}
```

### How It Works

The main entry point of this package sets up the DOM environment for all tests, which ensures that:

1. React component tests can access DOM APIs like `document` and `window`
2. Tests that don't need DOM access still work fine with the DOM environment loaded
3. All tests use a consistent setup

### Test File Structure

Test files should use Bun's test API:

```typescript
import { test, expect } from "bun:test";

test("my test", () => {
  // Test code here
  expect(1 + 1).toBe(2);
});
```
