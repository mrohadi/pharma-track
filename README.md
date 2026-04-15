# PharmaTrack

Pharmacy delivery management PoC — pharmacy uploads orders, patients confirm addresses via WhatsApp, drivers pick up and deliver with OTP-based confirmation, admin monitors in real time.

> Target region: Indonesia / SE Asia. Driver UX: mobile PWA. See [plan](/Users/mrohadi/.claude/plans/temporal-questing-ladybug.md) for full scope.

## Stack

- **Next.js 15** (App Router, TypeScript) — pharmacy, admin, and driver UIs in one app
- **PostgreSQL 16** + **Drizzle ORM**
- **Redis** + **BullMQ** (background jobs — added in Phase 2)
- **Better-Auth** (added in Phase 1 completion)
- **Meta WhatsApp Cloud API** (Phase 2)
- Docker Compose for local infra; AWS Lightsail for PoC deploy

## Repo layout

```
apps/
  web/                # Next.js app (/p pharmacy, /a admin, /d driver)
packages/
  db/                 # Drizzle schema + client
  shared/             # zod schemas, shared types
infra/
  docker-compose.yml  # Postgres + Redis for local dev
.github/workflows/    # CI
```

## Prerequisites

- Node 22 (use `nvm use`)
- pnpm 9.6
- Docker + Docker Compose

## Local setup

```bash
# 1. Install deps
pnpm install

# 2. Start Postgres + Redis
pnpm infra:up

# 3. Copy env
cp .env.example .env

# 4. Apply DB migrations
pnpm db:migrate

# 5. Run dev server
pnpm dev

# 6. (In another terminal) seed local dev users
pnpm db:seed
```

App runs at http://localhost:3000.

### Seed users (dev only)

| Email | Password | Role |
|---|---|---|
| `admin@pharmatrack.local` | `admin12345` | admin → redirects to `/a` |
| `pharmacy@pharmatrack.local` | `pharmacy12345` | pharmacy → redirects to `/p` |
| `driver@pharmatrack.local` | `driver12345` | driver → redirects to `/d` |

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start Next.js in dev mode |
| `pnpm build` | Build all packages |
| `pnpm typecheck` | TypeScript check across all packages |
| `pnpm lint` | Lint all packages |
| `pnpm format` / `pnpm format:check` | Prettier |
| `pnpm db:generate` | Generate a new Drizzle migration from schema changes |
| `pnpm db:migrate` | Apply pending migrations |
| `pnpm db:seed` | Seed dev users + demo pharmacy (requires dev server running) |
| `pnpm db:studio` | Open Drizzle Studio |
| `pnpm infra:up` / `infra:down` / `infra:logs` | Manage local Postgres + Redis |

## Git workflow

- All feature work on `feature/<scope>-<short-desc>` branches.
- Open PRs against `develop`. Squash-merge.
- `develop` → `main` via a release PR.
- Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/).

## Project phases

1. **Phase 1 — Foundations**: scaffold, auth, CSV upload, audit log _(in progress)_
2. **Phase 2 — Patient comms + assignment**: WhatsApp address collection, driver assignment
3. **Phase 3 — OTP + delivery**: pickup/delivery OTP, GPS, POD photo
4. **Phase 4 — Admin polish + launch**: exports, analytics, white-label, security pass

## License

Proprietary / internal — not open source.
