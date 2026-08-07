// Prisma config (replaces the old `"prisma"` key in package.json). Env vars
// are loaded from the repo-root `.env` so the API, docker-compose, and
// Prisma all share a single source of truth (see .env.example).
import path from 'node:path';
import { config } from 'dotenv';
import { defineConfig } from 'prisma/config';

config({ path: path.resolve(__dirname, '../../.env') });

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    // ts-node chokes on this: apps/api/tsconfig.json is a solution-style
    // config with no files/include of its own (TS5011), and the generated
    // Prisma client (`prisma-client` generator) is ESM-only — it reads
    // `import.meta.url` at module scope — which ts-node's ESM loader only
    // resolves with explicit extensions on every relative import. tsx sidesteps
    // both: esbuild-based, no project-file resolution, extensionless ESM
    // imports just work.
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: process.env['DATABASE_URL'],
  },
});
