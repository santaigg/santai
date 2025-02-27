# @repo/database

This package contains the database client and utilities for interacting with Supabase in the project.

## Setup for Local Development

### Prerequisites

- [Bun](https://bun.sh/) - Our package manager (You can also use NPM just don't commit the lockfile)
- [Supabase CLI](https://supabase.com/docs/guides/cli) (optional, for advanced local development)

### Environment Setup

1. Copy the example environment file:

```bash
cp .env.example .env.local
```

2. Fill in the environment variables in `.env.local`:

```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
DATABASE_URL=your_database_url
```

For team members without direct database access, you can use the seeded database for local development (see below).

### Installation

```bash
bun install
```

## Using the Database Client

The database client is exported from this package and can be used in your application:

```typescript
import { db } from "@repo/database";

// Example: Fetch users
const { data, error } = await db.from('users').select('*');
```

## Database Seeding with Snaplet

We use [Snaplet](https://docs.snaplet.dev/) to generate seed data for local development. This is especially important for team members who don't have direct access to the production database.

### Running the Seed Script

To seed your local database with test data:

```bash
bun run tsx seed.ts
```

This will:
1. Reset your database (delete all existing data)
2. Seed it with 10 test users
3. Add any other seed data defined in the script

> ⚠️ **Warning**: Running the seed script will delete all data in your database. Make sure you're not running this against a production database.

### Production Database Safeguards

The seed scripts include safeguards to prevent accidental wiping of production databases:

1. The scripts check if the database URL contains production indicators (`production`, `prod`, `supabase.co`) or if `NODE_ENV` is set to "production".
2. If a production database is detected, the script will abort with an error message.
3. If you absolutely need to seed a production database (not recommended), you can override the safeguards by setting `FORCE_SEED=true` in your environment.

```bash
# Only use this if you ABSOLUTELY know what you're doing
FORCE_SEED=true bun run tsx seed.ts
```

When `FORCE_SEED=true` is set, the script will show a warning and add a 5-second delay to give you time to abort the operation.

### Customizing Seed Data

You can modify the `seed.ts` file to customize the seed data according to your needs. Refer to the [Snaplet documentation](https://docs.snaplet.dev/seed/getting-started) for more details.

## Local Development with Supabase

For more advanced local development, you can use the Supabase CLI to run a local instance of Supabase:
Read more about it [here](https://supabase.com/docs/guides/local-development/overview).

1. Install the Supabase CLI: [Installation Guide](https://supabase.com/docs/guides/cli/getting-started)

2. Start a local Supabase instance:
```bash
supabase start
```

3. Update your `.env.local` file with the local Supabase credentials.

## Database Types

The database types are generated from the Supabase schema and stored in `database.types.ts`. These types provide type safety when interacting with the database.

## Configuration

- `seed.config.ts` - Configuration for Snaplet seed
- `supabase/config.toml` - Supabase configuration

## Troubleshooting

- If you encounter connection issues, ensure your environment variables are correctly set.
- For team members without database access, ensure you've run the seed script to populate your local database.
- If types are not updating, you may need to regenerate the database types or restart your TypeScript server. 