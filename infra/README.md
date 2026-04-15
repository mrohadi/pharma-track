# Infrastructure

## Local development

```bash
pnpm infra:up     # Postgres + Redis via docker compose
pnpm infra:logs   # tail logs
pnpm infra:down   # stop containers (data persists in ./.data)
```

Data is persisted under `infra/.data/` (gitignored). Delete that folder to reset.

## Production (PoC): AWS Lightsail

Target: single $5 instance, Ubuntu 22.04, Docker + Docker Compose. Services: Postgres, Redis, Next.js, BullMQ worker, Caddy (TLS).

Detailed setup guide lands in Phase 4 along with the deploy workflow. See `/Users/mrohadi/.claude/plans/temporal-questing-ladybug.md` for the topology.
