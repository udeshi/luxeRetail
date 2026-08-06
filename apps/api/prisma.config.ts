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
    seed: 'ts-node --transpile-only prisma/seed.ts',
  },
  datasource: {
    url: process.env['DATABASE_URL'],
  },
});
