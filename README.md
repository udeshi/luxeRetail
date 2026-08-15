# LuxeRetail

A full-stack e-commerce platform — customer storefront, admin dashboard, and
a mobile app, sharing one NestJS API and one Postgres database. Built as a
portfolio project to demonstrate authentication, CRUD, sandbox payments,
file uploads, and a monorepo architecture designed to keep growing without a
rewrite.

Read **[ARCHITECTURE.md](./ARCHITECTURE.md)** for the reasoning behind the
structure (Nx boundaries, CQRS + hexagonal architecture in the API, the
auth token strategy, etc.) — this file is just setup and day-to-day commands.

This repo is intended to be run locally with the included Docker services and
local environment defaults, making it easy to explore the platform end-to-end
without changing the codebase structure.

## Stack

| | |
|---|---|
| Monorepo | Nx + pnpm workspaces |
| API | NestJS, CQRS (`@nestjs/cqrs`), Prisma, PostgreSQL |
| Storefront & Admin | React + Vite, TanStack Router (file-based) + TanStack Query, Tailwind v4 |
| Mobile | Expo + Expo Router, React Native |
| Shared | Zod contracts, a typed API client + React Query hooks, one Tailwind theme |
| Payments | Stripe (test mode) |
| Storage | S3-compatible (MinIO locally) via presigned URLs |
| Jobs / email | BullMQ + Redis, Mailhog locally |

## Prerequisites

- Node 24, [pnpm](https://pnpm.io) 10+
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for Postgres/Redis/MinIO/Mailhog)
- A free [Stripe](https://dashboard.stripe.com/register) account, test-mode keys
- For the mobile app: [Expo Go](https://expo.dev/go) on your phone, or an iOS/Android simulator

## Setup

```bash
pnpm install
cp .env.example .env          # fill in your Stripe test keys; everything else has a working local default
docker compose -f infra/docker-compose.yml up -d
pnpm exec nx run api:prisma-migrate   # creates the schema
pnpm exec nx run api:prisma-seed      # demo catalog + admin/customer accounts
```

Seeded accounts (password for both: `Password123!`):

- `admin@luxeretail.dev` — admin console access
- `customer@luxeretail.dev` — regular shopper, empty cart

### Stripe webhook (checkout won't complete without this)

Checkout only marks an order `PAID` when Stripe's webhook fires — install
the [Stripe CLI](https://docs.stripe.com/stripe-cli) and forward events to
your local API while it's running:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the `whsec_...` it prints into `.env` as `STRIPE_WEBHOOK_SECRET`.

## Running it

```bash
pnpm exec nx serve api          # http://localhost:3000/api — Swagger at /api/docs
pnpm exec nx serve storefront   # http://localhost:4200
pnpm exec nx serve admin        # http://localhost:4300
pnpm exec nx run mobile:start   # opens Expo dev tools — scan the QR with Expo Go
```

Try it: browse the seeded catalog on the storefront, add something to your
cart, sign in as the customer account, and check out with Stripe's test
card `4242 4242 4242 4242` (any future expiry, any CVC). Then sign into the
admin console and watch the order show up.

## Common commands

```bash
pnpm exec nx run-many -t lint typecheck test    # everything, whole workspace
pnpm exec nx affected -t lint typecheck test    # only what your changes could have broken
pnpm exec nx graph                              # visualize the project/dependency graph
pnpm exec nx run api:prisma-studio              # browse the database in a GUI
```

Prefix any of these with `pnpm exec` (already shown above) or install Nx
globally to drop it (`nx run-many ...`).

## Mobile app: EAS Build & OTA updates

Building an installable app or shipping an over-the-air JS update needs an
[Expo account](https://expo.dev/signup) and the EAS CLI:

```bash
npm install -g eas-cli
eas login
cd apps/mobile
eas init                 # links this app to your Expo account, writes a project ID into app.json
eas build --profile preview --platform ios     # or android
eas update --branch production                 # ships a JS-only change instantly, no store review
```

None of this is required for local development — `nx run mobile:start` runs
entirely without an Expo account.

## Project layout

```
apps/
  api/          NestJS — REST API (CQRS + hexagonal architecture)
  storefront/    React + Vite — public storefront
  admin/          React + Vite — admin dashboard
  mobile/          Expo — customer mobile app
libs/shared/
  contracts/       Zod schemas — the single source of truth for every shape
                   that crosses a process boundary (API DTOs, frontend types,
                   form validation — all from the same definition)
  api-client/       Typed fetch client + TanStack Query hooks, used by
                   storefront, admin, and mobile
  ui/               Web component kit (storefront + admin only)
  utils/             Small framework-agnostic helpers
infra/
  docker-compose.yml   Postgres, Redis, MinIO, Mailhog for local dev
```

## What's deliberately not built yet

Documented as concrete extension points (with the reasoning) in
[ARCHITECTURE.md](./ARCHITECTURE.md#not-built-this-pass-documented-extension-points):
mobile checkout (mobile browses/carts/reads orders; purchasing happens on
the storefront web checkout in this build), the push-notification *send*
side (registration works; there's nowhere to send to yet), and NativeWind
on mobile (styling is plain `StyleSheet` today, sharing the same color
values as the web Tailwind theme by hand rather than the same syntax).
