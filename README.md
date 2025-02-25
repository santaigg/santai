# Santai.GG Monorepo

The Santai.GG Monorepo is a collection of services and applications that make up the Santai.GG ecosystem.

## What's in this repo?

This Monorepo includes the following packages and apps:

### Apps and Packages

- `api`: an [ElysiaJS](https://expressjs.com/) server
- `web`: a [Next.js](https://nextjs.org/) app
- `pulsefinder`: a private game service app (added as a git submodule)
- `discord-bot`: a [DiscordJS](https://discord.js.org/) bot
- `twitch-bot`: a [Twurple](https://twurple.js.org/) bot
- `@repo/eslint-config`: ESLint configurations used throughout the monorepo
- `@repo/bun-test-presets`: Bun test configurations
- `@repo/logger`: isomorphic logger (a small wrapper around console.log)
- `@repo/ui`: a dummy React UI library (which contains `<CounterButton>` and `<Link>` components)
- `@repo/typescript-config`: tsconfig.json's used throughout the monorepo

Each package and app is 100% [TypeScript](https://www.typescriptlang.org/).

### Git Submodules

This repository includes the following git submodules:

- `apps/pulsefinder`: A private repository containing sensitive game service functionality.

For detailed instructions on working with the pulsefinder submodule, see [PULSEFINDER.md](docs/PULSEFINDER.md).

### Utilities

This Turborepo has some additional tools already setup for you:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Bun](https://bun.sh/) for package-manager and testing.
- [Prettier](https://prettier.io) for code formatting

### Scripts

The following scripts are available in the root package.json:

- `bun dev` - Runs the development server for all apps
- `bun build` - Builds all apps and packages
- `bun lint` - Runs ESLint for all apps and packages
- `bun clean` - Cleans build outputs for all apps and packages
- `bun test` - Runs tests for all apps and packages
- `bun check-types` - Runs TypeScript type checking for all apps and packages
- `bun create` - Interactive script to create new apps or packages
- `bun clean-modules` - Cleans all node_modules directories in the monorepo (excluding dot directories)
