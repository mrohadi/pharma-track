#!/usr/bin/env bash
# Wrapper that normalises .env.prod → infra/.env and runs docker compose.
# Handles: comments, blank lines, "export KEY=VALUE", "KEY = VALUE", "KEY VALUE".
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
OUT="$SCRIPT_DIR/.env"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "ERROR: $ENV_FILE not found." >&2
  exit 1
fi

sed -E \
  -e '/^[[:space:]]*#/d' \
  -e '/^[[:space:]]*$/d' \
  -e 's/^[[:space:]]*export[[:space:]]+//' \
  -e 's/^([A-Za-z_][A-Za-z0-9_]*)[[:space:]]*=[[:space:]]*/\1=/' \
  -e 's/^([A-Za-z_][A-Za-z0-9_]*)[[:space:]]+([^[:space:]])/\1=\2/' \
  "$ENV_FILE" \
  | grep -E '^[A-Za-z_][A-Za-z0-9_]*=' \
  > "$OUT" || true

if [[ ! -s "$OUT" ]]; then
  echo "ERROR: infra/.env is empty after normalising $ENV_FILE." >&2
  echo "Expected format: KEY=VALUE (one per line, no spaces around =)." >&2
  exit 1
fi

exec docker compose -f "$COMPOSE" "$@"
