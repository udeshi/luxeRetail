# Architecture

This document explains the decisions behind LuxeRetail's structure — why an
Nx monorepo, why CQRS + hexagonal architecture in the API, why two separate
web apps, and where the deliberate seams are for extending the system later.
If you're new to the codebase, read this before `README.md`'s setup steps.

## Monorepo layout

```
luxeretail/
  apps/
    storefront/      React + Vite + TanStack Router — public storefront
    admin/            React + Vite + TanStack Router — admin dashboard
    api/               NestJS — REST API (CQRS + hexagonal architecture)
    mobile/            Expo + Expo Router — customer mobile app
  libs/shared/
    contracts/          Zod schemas — single source of truth for every shape
                        that crosses a process boundary
    api-client/          Typed fetch client + TanStack Query hooks, shared
                        by storefront, admin, and mobile
    ui/                  Web component kit (shadcn/ui-style), storefront +
                        admin only — not usable from React Native
    utils/                Small framework-agnostic helpers (formatPrice, slugify)
  infra/
    docker-compose.yml   Postgres, Redis, MinIO (S3-compatible), Mailhog
```

**Nx**, not a simpler tool like Turborepo, because this workspace has real
architectural constraints to enforce (which app can import what) and a
genuinely polyglot set of targets (Vite, webpack/NestJS, Metro/Expo) that
benefit from Nx's project graph and `affected` — CI only re-checks what a
change could actually break, not the whole repo.

**Two separate frontend apps** (`storefront`, `admin`) instead of one app
with route groups: the storefront is public and performance-sensitive; the
admin app is internal and auth-gated from the first byte. Splitting them
means the storefront's bundle never ships a single line of admin code, and
each can be deployed, scaled, and secured independently. Both share
`libs/shared/ui` and `libs/shared/api-client` — the split is a routing/
deployment decision, not a reason to duplicate logic.

### Module boundaries are enforced, not aspirational

`eslint.config.mjs` encodes the dependency rules as `@nx/enforce-module-
boundaries` constraints, keyed by tags on each project:

| Tag | Can depend on |
|---|---|
| `scope:storefront` | itself, `scope:shared-universal`, `scope:shared-web` |
| `scope:admin` | itself, `scope:shared-universal`, `scope:shared-web` |
| `scope:mobile` | itself, `scope:shared-universal` (never `shared-web` — React Native can't render `<div>`s) |
| `scope:api` | itself, `scope:shared-universal` (never frontend code) |
| `scope:shared-web` | itself, `scope:shared-universal` |
| `scope:shared-universal` | itself only |

A PR that tries to import `libs/shared/ui` from the mobile app fails lint,
not code review. That's the difference between an architecture that's
documented and one that's real.

## Backend: clean/hexagonal architecture + CQRS

Every feature module under `apps/api/src/modules/*` follows the same shape.
Using `catalog` (products) as the concrete example:

```
catalog/
  domain/                     Entities, value objects, repository *interfaces*
                              (ports) — zero framework/Prisma imports
  application/
    commands/                  Writes: CreateProductCommand + CreateProductHandler,
                              one file, dispatched through Nest's CommandBus
    queries/                    Reads: ListProductsQuery + ListProductsHandler,
                              dispatched through the QueryBus
  infrastructure/               PrismaProductRepository implements the port —
                              the only file that imports Prisma
  interface/http/
    request/                    Request DTOs — createZodDto() wrapping a schema
                              from libs/shared/contracts
    response/                    Response DTOs, same pattern
    mappers/                      Domain entity <-> HTTP DTO. A controller never
                              serializes a domain entity directly.
    products.controller.ts        Thin: parse request -> map to Command/Query ->
                              dispatch -> map result -> Response DTO
  catalog.module.ts
```

**Why CQRS specifically**: a controller method is always `map in → dispatch →
map out`. All business logic lives in exactly one handler per command/query,
and handlers are unit-testable without spinning up HTTP or a real database
(mock the repository port). Adding a new read model or side effect is a new
handler, not a growing service method.

**Why ports & adapters**: application code depends on a `ProductRepository`
*interface*, never on `@prisma/client` directly. Swapping Prisma for another
ORM — or Stripe for another payment provider, or S3 for another object
store — means writing one new adapter behind the existing port. Nothing in
`application/` or `interface/` changes. Concretely:

- `catalog/domain/product.repository.ts` — the port
- `catalog/infrastructure/prisma-product.repository.ts` — the only adapter today
- `catalog.module.ts` binds them: `{ provide: PRODUCT_REPOSITORY, useClass: PrismaProductRepository }`

**Cross-module communication is one-directional and event-driven where it
matters.** Modules that need another module's data import its exported
repository token (e.g. `orders` imports `CART_REPOSITORY` from `cart` and
`PAYMENT_GATEWAY` from `payments` to run checkout) — always one direction,
never circular. Where two modules shouldn't know about each other at all,
they communicate via `EventBus`:

- `auth` publishes `UserRegisteredEvent` → `cart` listens and provisions an
  empty cart. Auth has no idea a cart module exists.
- `orders` publishes `OrderPaidEvent` (after the Stripe webhook confirms
  payment) → `notifications` listens and enqueues the confirmation email.
  Orders has no idea email exists.

This is the same decoupling technique NestJS CQRS is built for, used twice
in this codebase as a deliberate pattern, not a one-off.

### Contracts: one schema, three consumers

`libs/shared/contracts` defines each shape once with Zod — `Product`,
`Order`, `RegisterRequest`, etc. — and it's reused for:

1. **API request validation** — `nestjs-zod`'s `createZodDto()` wraps the
   schema into a class the global `ZodValidationPipe` validates against.
2. **API Swagger docs** — the same DTO class feeds `@nestjs/swagger`, so the
   OpenAPI schema can't drift from the actual validator.
3. **Frontend types + form validation** — `z.infer<typeof Schema>` gives the
   TS type, and the same schema drives `zodResolver()` in every
   `react-hook-form` on web and mobile.

Change a shape once; every consumer is type-checked against the new version.

### Auth: one login endpoint, two token strategies

Access tokens (15 min) are always sent as an `Authorization: Bearer` header
and never touch a cookie. Refresh tokens differ by platform, decided
entirely client-side with **zero branching on the server**:

- **Web** (storefront/admin): the browser calls `/auth/login` with
  `credentials: 'include'`. The API sets an httpOnly, `Secure`,
  `SameSite=Strict` refresh cookie *and* returns both tokens in the JSON
  body. The web app keeps the access token in memory only (never
  localStorage — an XSS payload reading persisted storage is a far more
  common real-world attack than one intercepting a JS variable) and simply
  ignores the refresh token in the body, since the cookie already has it. A
  page reload calls `POST /auth/refresh` on boot to silently restore a
  session from that cookie.
- **Mobile**: `fetch` on React Native doesn't persist cookies, so the app
  reads both tokens from the response body and stores them in
  `expo-secure-store` (OS keychain/keystore — not `AsyncStorage`, which is
  unencrypted). It sends the refresh token explicitly in the request body
  to `/auth/refresh`.

Refresh tokens are stored **hashed** (`sha256`) in the database and rotated
on every use — the presented token is revoked the moment a new one is
issued, so a replayed/stolen token fails immediately.

### Payments: Stripe in test mode, webhook-driven

`POST /orders` creates a `PENDING` order from the caller's cart and asks the
`PaymentGateway` port (`StripePaymentGateway` today) for a PaymentIntent,
returning its `clientSecret` to the client. The order only ever becomes
`PAID` when the Stripe **webhook** (`POST /webhooks/stripe`, signature-
verified) fires — the client confirming payment with Stripe.js is not
itself trusted to mark an order paid. That's the actual authorization
boundary or admin dashboard.

The webhook needs the raw, unparsed request body to verify Stripe's
signature; `main.ts` passes `{ rawBody: true }` to `NestFactory.create` so
`req.rawBody` is available alongside Nest's normal JSON body parsing,
instead of the usual `express.raw()` gymnastics (and their pnpm/ordering
footguns).

### Uploads: presigned URLs, never proxied bytes

The admin app asks `POST /admin/uploads/presign` for a scoped, time-limited
PUT URL, uploads the file **directly** to object storage (MinIO locally,
swap for S3/R2 in prod by changing only `S3StorageAdapter`), then sends the
resulting public URL back as part of a product's `imageUrls`. The API
process never touches file bytes.

## Frontend: React + TanStack Router + TanStack Query

Both storefront and admin are Vite-built React SPAs with **file-based
routing via TanStack Router** — deliberately chosen to mirror the same
mental model as Expo Router on mobile (`routes/` on web, `app/` on mobile,
both filesystem = route tree). TanStack Query owns all server state through
`libs/shared/api-client`'s hooks; Zustand holds only the small amount of
client-only state each app actually has (the session — access token, user —
kept in memory on web, see "Auth" above).

Tailwind v4 (CSS-first `@theme` tokens) styles both apps from one shared
`libs/shared/ui/src/styles/theme.css`, imported by each app's `styles.css`.

### Mobile styling

React Native can't run Tailwind — components render to native views, not a
DOM. Mobile duplicates the same brand color *values* into a small
`src/lib/theme.ts` and styles screens with `StyleSheet.create`. NativeWind
would let mobile share the actual Tailwind syntax with web, and is a
reasonable next step, deliberately not wired up in this pass to avoid an
unverified Metro/PostCSS integration on top of everything else here — see
"Not built this pass" below.

## Database

PostgreSQL via Prisma (`apps/api/prisma/schema.prisma`). Money is always an
integer `*Cents` column plus a `currency` string — never a float, so
rounding bugs can't creep in. Order line items snapshot the product name,
variant attributes, and price at the moment of purchase, so a later product
edit or deletion can never change what a historical order shows.

## Background jobs

BullMQ + Redis, one real queue (`email`) established as the pattern: the
`orders` module's `OrderPaidEvent` handler in `notifications` enqueues an
order-confirmation email rather than sending it inline in the webhook
request — a slow SMTP call never blocks the response that triggered it.
Adding abandoned-cart reminders or shipping notifications later is a new
event handler enqueuing a new job, not new inline logic somewhere.

## Not built this pass (documented extension points)

Scoped out deliberately, each with a specific reason and a starting point:

- **Mobile checkout** — the mobile app browses, adds to cart, and reads real
  order history, but purchasing happens on the storefront web checkout in
  this build. A native checkout would use `@stripe/stripe-react-native`,
  which needs a native module (EAS dev build, not Expo Go) to test — a
  reasonable next milestone, not wired up here.
- **Push notification send side** — `src/lib/push-notifications.ts`
  registers the device and mints a real Expo push token; there's
  intentionally nowhere to send it yet. Sending needs an Apple/Google push
  credential this project doesn't have. Extension point: give
  `notifications` a device-token registry + a push-provider adapter, the
  same port/adapter pattern already used for email (`MailerService`) and
  storage (`StoragePort`).
- **NativeWind** — see "Mobile styling" above.
- **Two-app split for storefront/admin already exists**; a further split
  (e.g. a separate `apps/admin-api` if the admin surface outgrows sharing
  one API) would follow the same pattern already established between
  `storefront` and `admin`.
