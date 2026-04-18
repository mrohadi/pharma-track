#!/usr/bin/env bash
# Wrapper around docker compose that strips comments/blank lines from .env.prod
# before passing it via --env-file (older Docker Compose rejects comment lines).
#
# Usage (from repo root):
#   ./infra/dc.sh up -d postgres redis
#   ./infra/dc.sh run --rm migrator
#   ./infra/dc.sh up -d --no-deps --wait web
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$REPO_ROOT/.env.prod"
COMPOSE="$REPO_ROOT/infra/docker-compose.prod.yml"

CLEAN_ENV=$(mktemp)
grep -v '^\s*#' "$ENV_FILE" | grep -v '^\s*$' > "$CLEAN_ENV"
trap 'rm -f "$CLEAN_ENV"' EXIT

exec docker compose -f "$COMPOSE" --env-file "$CLEAN_ENV" "$@"
