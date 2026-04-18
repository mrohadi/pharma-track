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

# Write comment-free env to infra/.env — docker compose reads .env from the
# directory of the first compose file, not from the working directory.
grep -v '^\s*#' "$ENV_FILE" | grep -v '^\s*$' > "$SCRIPT_DIR/.env"

exec docker compose -f "$COMPOSE" "$@"
