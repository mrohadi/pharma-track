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

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
ENV_FILE="$REPO_ROOT/.env.prod"
COMPOSE="$SCRIPT_DIR/docker-compose.prod.yml"

# Normalise .env.prod → infra/.env so docker compose can read it.
# Handles: comment lines, blank lines, "export KEY=VALUE", "KEY = VALUE".
sed -E \
  -e '/^[[:space:]]*#/d' \
  -e '/^[[:space:]]*$/d' \
  -e 's/^[[:space:]]*export[[:space:]]+//' \
  -e 's/^([A-Za-z_][A-Za-z0-9_]*)[[:space:]]*=[[:space:]]*/\1=/' \
  "$ENV_FILE" \
  | grep -E '^[A-Za-z_][A-Za-z0-9_]*=' \
  > "$SCRIPT_DIR/.env"

exec docker compose -f "$COMPOSE" "$@"
