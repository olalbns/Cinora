#!/usr/bin/env sh
set -eu
mkdir -p backups
STAMP=$(date +%Y%m%d-%H%M%S)
docker compose exec -T postgres pg_dump -U cinora -d cinora -Fc > "backups/cinora-$STAMP.dump"
echo "Backup: backups/cinora-$STAMP.dump"
