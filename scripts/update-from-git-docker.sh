#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/landing-server}"
BRANCH="${BRANCH:-main}"

cd "$APP_DIR"

git fetch origin "$BRANCH"

LOCAL_COMMIT="$(git rev-parse HEAD)"
REMOTE_COMMIT="$(git rev-parse "origin/$BRANCH")"

if [ "$LOCAL_COMMIT" = "$REMOTE_COMMIT" ]; then
  exit 0
fi

git pull --ff-only origin "$BRANCH"
docker compose up -d --build --remove-orphans
docker image prune -f
