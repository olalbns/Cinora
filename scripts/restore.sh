#!/usr/bin/env sh
set -eu
FILE=${1:?"Usage: scripts/restore.sh backups/cinora-YYYYMMDD-HHMMSS.dump"}
docker compose exec -T postgres pg_restore -U cinora -d cinora --clean --if-exists < "$FILE"
echo "Restauration terminée"
