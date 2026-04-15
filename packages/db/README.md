# @pharmatrack/db

Drizzle ORM schema and migration runner.

## Commands (run from repo root)

```bash
pnpm db:generate   # create a new migration from schema/*.ts changes
pnpm db:migrate    # apply pending migrations to $DATABASE_URL
pnpm db:studio     # open Drizzle Studio for data browsing
```

## Workflow

1. Edit a schema file under `src/schema/*.ts`.
2. Run `pnpm db:generate` → a new SQL file lands in `drizzle/`.
3. Review the generated SQL, commit schema + migration together.
4. `pnpm db:migrate` applies it locally; CI applies it against an ephemeral Postgres and fails if schema/migration drift.

## Conventions

- One schema file per table, under `src/schema/`, re-exported from `src/schema/index.ts`.
- Migrations are append-only — never edit a committed migration. If a migration is wrong, add a new one that corrects it.
- Keep `down` migrations out for now; we roll forward only.
