#!/bin/sh
set -e

echo "\n[i] Running Prisma migrations\n"
# Baseline: mark 0_init as applied without running it (db already has these tables).
# Fails silently if already resolved on subsequent restarts.
./node_modules/.bin/prisma migrate resolve --applied 0_init 2>/dev/null || true
./node_modules/.bin/prisma migrate deploy

echo "\n[i] Starting the API\n"
exec pnpm run start:prod
