#!/usr/bin/env bash
# Wrapper that generates a comment-free .env at the repo root from .env.prod,
# then runs docker compose. After the first run, plain docker compose commands
# also work because compose auto-reads .env from the working directory.
#
# Usage (from repo root):
#   ./infra/dc.sh up -d postgres redis
#   ./infra/dc.sh run --rm migrator
#   ./infra/dc.sh up -d --no-deps --wait web
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$REPO_ROOT/.env.prod"
COMPOSE="$REPO_ROOT/infra/docker-compose.prod.yml"

grep -v '^\s*#' "$ENV_FILE" | grep -v '^\s*$' > "$REPO_ROOT/.env"

exec docker compose -f "$COMPOSE" "$@"
