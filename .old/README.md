# Santai.GG Monorepo

### Apps and Packages

- `web`: a [Next.js](https://nextjs.org/) app (Santai.GG) [Port: 3000]
- `backend`: a [Elysia](https://elysiajs.com/) app (Smokeshift) [Port: 3002]
- `api`: a [Elysia](https://elysiajs.com/) app (Wavescan) [Port: 3003]
- `pulsefinder`: a [Elysia](https://elysiajs.com/) app (Pulsefinder) [Port: 3004] - **Submodule**
- `old-web`: a [Astro](https://astro.build/) temp-app (Santai.GG's old website) [Port: 4321]
- `discord-bot`: a [Discord.js](https://discord.js.org/) bot (Discord Bot)
- `@repo/ui`: a stub React component library shared by both `web` and `docs` applications
- `@repo/eslint-config`: `eslint` configurations (includes `eslint-config-next` and `eslint-config-prettier`)
- `@repo/typescript-config`: `tsconfig.json`s used throughout the monorepo

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

### Utilities

This Turborepo has some additional tools already setup for you:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting

### Build

To build all apps and packages, run the following command:

```
cd santai-monorepo
bun build
```

### Develop

To develop all apps and packages, run the following command:

```
cd santai-monorepo
bun dev
```

## Turborepo Useful Links

Learn more about the power of Turborepo:

- [Tasks](https://turbo.build/repo/docs/core-concepts/monorepos/running-tasks)
- [Caching](https://turbo.build/repo/docs/core-concepts/caching)
- [Remote Caching](https://turbo.build/repo/docs/core-concepts/remote-caching)
- [Filtering](https://turbo.build/repo/docs/core-concepts/monorepos/filtering)
- [Configuration Options](https://turbo.build/repo/docs/reference/configuration)
- [CLI Usage](https://turbo.build/repo/docs/reference/command-line-reference)
