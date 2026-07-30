#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

LOCK_FILE="${OPUS_AUTO_REFRESH_LOCK:-/tmp/opus-auto-refresh.lock}"
LOG_DIR="${OPUS_AUTO_REFRESH_LOG_DIR:-$ROOT_DIR/logs}"
LOG_FILE="${OPUS_AUTO_REFRESH_LOG:-$LOG_DIR/opus-auto-refresh.log}"

HOST_DB_DIR="$ROOT_DIR/data/opus"
HOST_DB="$HOST_DB_DIR/opusdata.db"
CANDIDATE_DB="$HOST_DB_DIR/opusdata.candidate.db"
PREVIOUS_DB="$HOST_DB_DIR/opusdata.previous.db"
BOOTSTRAP_IMAGE="${OPUS_DBTOOLS_IMAGE:-opus-dbtools:latest}"
APP_IMAGE="${OPUS_APP_IMAGE:-opus-web:latest}"
PREVIOUS_IMAGE="${OPUS_PREVIOUS_IMAGE:-opus-web:previous-auto}"
SMOKE_BASE_URL="${OPUS_SMOKE_BASE_URL:-http://localhost:3000}"

HAD_PREVIOUS_IMAGE=0
KEEP_CANDIDATE=0

mkdir -p "$LOG_DIR" "$HOST_DB_DIR"
exec > >(tee -a "$LOG_FILE") 2>&1

log() {
  printf '%s %s\n' "$(date -Is)" "$*"
}

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    log "Required command not found: $1"
    exit 1
  fi
}

preflight() {
  local cmd
  for cmd in docker make flock cp curl tee date; do
    require_command "$cmd"
  done
}

cleanup() {
  if [ "$KEEP_CANDIDATE" != "1" ] && [ -f "$CANDIDATE_DB" ]; then
    rm -f "$CANDIDATE_DB"
  fi
}
trap cleanup EXIT

exec 9>"$LOCK_FILE"
if ! flock -n 9; then
  log "Another OPUS auto-refresh is already running; skipping."
  exit 0
fi

run_dbtools() {
  docker run --rm \
    -v "$HOST_DB_DIR:/data/opus" \
    "$BOOTSTRAP_IMAGE" \
    "$@"
}

ensure_templates() {
  log "Ensuring Dockerfile and Dockerfile.dbtools exist."
  make Dockerfile Dockerfile.dbtools
}

build_dbtools_image() {
  log "Building DB tools image: $BOOTSTRAP_IMAGE"
  docker build -f Dockerfile.dbtools -t "$BOOTSTRAP_IMAGE" .
}

seed_candidate_db() {
  log "No host OPUS DB found; seeding candidate DB before update."
  run_dbtools /bin/bash -lc '
    set -euo pipefail
    mkdir -p /data/opus
    /opt/pyenv/bin/opus_get -l -d RF -s en -t sv --local_db
    cp /root/.OpusTools/opusdata.db /data/opus/opusdata.candidate.db
  '
}

prepare_candidate_db() {
  rm -f "$CANDIDATE_DB"
  if [ -f "$HOST_DB" ]; then
    log "Copying current host DB to candidate DB."
    cp --reflink=auto "$HOST_DB" "$CANDIDATE_DB"
  else
    seed_candidate_db
  fi
}

update_candidate_db() {
  log "Updating candidate OPUS DB. This can take over an hour."
  run_dbtools /bin/bash -lc '
    set -euo pipefail
    /opt/pyenv/bin/opus_get -u -db /data/opus/opusdata.candidate.db --suppress_prompts
  '
}

sqlite_integrity_check() {
  local db_name="$1"
  local result
  result="$(
    run_dbtools /bin/bash -lc '
      set -euo pipefail
      sqlite3 "/data/opus/$1" "PRAGMA integrity_check;"
    ' _ "$db_name"
  )"

  if [ "$result" != "ok" ]; then
    log "SQLite integrity check failed for $db_name: $result"
    return 1
  fi
}

corpus_manifest() {
  local db_name="$1"
  run_dbtools /bin/bash -lc '
    set -euo pipefail
    export OPUSAPI_DB="/data/opus/$1"
    json=$(/opt/pyenv/bin/python python_tools/readdata.py "{\"corpora\":\"True\"}")
    count=$(printf "%s" "$json" | jq -r ".corpora | length")
    hash=$(printf "%s" "$json" | jq -r ".corpora[]?" | sort | sha256sum | awk "{print \$1}")
    printf "%s %s\n" "$count" "$hash"
  ' _ "$db_name"
}

validate_candidate_db() {
  log "Validating candidate DB."
  sqlite_integrity_check "opusdata.candidate.db"

  local count hash
  read -r count hash < <(corpus_manifest "opusdata.candidate.db")
  if [ -z "$count" ] || [ "$count" = "0" ]; then
    log "Candidate DB validation failed: corpus list is empty."
    return 1
  fi

  log "Candidate DB contains $count corpora; hash=$hash"
}

current_manifest_or_empty() {
  if [ ! -f "$HOST_DB" ]; then
    printf "0 none\n"
    return 0
  fi

  sqlite_integrity_check "opusdata.db"
  corpus_manifest "opusdata.db"
}

save_previous_state() {
  rm -f "$PREVIOUS_DB"
  if [ -f "$HOST_DB" ]; then
    log "Saving previous host DB."
    cp --reflink=auto "$HOST_DB" "$PREVIOUS_DB"
  fi

  if docker image inspect "$APP_IMAGE" >/dev/null 2>&1; then
    log "Tagging current app image as $PREVIOUS_IMAGE."
    docker tag "$APP_IMAGE" "$PREVIOUS_IMAGE"
    HAD_PREVIOUS_IMAGE=1
  else
    log "No existing $APP_IMAGE image found; rollback will only restore the DB."
  fi
}

restore_previous_db() {
  if [ -f "$PREVIOUS_DB" ]; then
    log "Restoring previous host DB."
    mv -f "$PREVIOUS_DB" "$HOST_DB"
  else
    log "No previous host DB backup exists to restore."
  fi
}

rollback_deploy() {
  log "Rolling back OPUS web deployment."
  restore_previous_db

  if [ "$HAD_PREVIOUS_IMAGE" = "1" ]; then
    docker tag "$PREVIOUS_IMAGE" "$APP_IMAGE"
    docker compose up -d --force-recreate opus-web || true
  else
    log "No previous image tag is available for rollback."
  fi
}

swap_candidate_db() {
  log "Promoting candidate DB to host DB."
  KEEP_CANDIDATE=1
  mv -f "$CANDIDATE_DB" "$HOST_DB"
  KEEP_CANDIDATE=0
}

build_app_image() {
  log "Building app image with refreshed OPUS DB."
  docker compose build opus-web
}

deploy_app() {
  log "Starting refreshed app container."
  docker compose up -d --force-recreate opus-web
}

smoke_check() {
  local path
  for path in "/" "/opusapi/?corpora=True" "/corpora"; do
    log "Smoke checking $SMOKE_BASE_URL$path"
    local ok=0
    for _ in 1 2 3 4 5 6 7 8 9 10 11 12; do
      if curl -fsS --max-time 10 "$SMOKE_BASE_URL$path" >/dev/null; then
        ok=1
        break
      fi
      sleep 5
    done
    if [ "$ok" != "1" ]; then
      log "Smoke check failed for $SMOKE_BASE_URL$path"
      return 1
    fi
  done
}

main() {
  log "Starting daily OPUS DB auto-refresh."

  preflight
  ensure_templates
  build_dbtools_image

  local old_count old_hash new_count new_hash
  read -r old_count old_hash < <(current_manifest_or_empty)
  log "Current host DB corpus count=$old_count; hash=$old_hash"

  prepare_candidate_db
  update_candidate_db
  validate_candidate_db
  read -r new_count new_hash < <(corpus_manifest "opusdata.candidate.db")

  if [ "$old_hash" = "$new_hash" ]; then
    log "No corpus list changes detected; skipping app rebuild/redeploy."
    rm -f "$CANDIDATE_DB"
    log "OPUS DB auto-refresh finished without deployment."
    exit 0
  fi

  log "Corpus list changed: old_count=$old_count new_count=$new_count"
  save_previous_state
  swap_candidate_db

  if ! build_app_image; then
    log "App image build failed."
    restore_previous_db
    exit 1
  fi

  if ! deploy_app; then
    log "App deploy failed."
    rollback_deploy
    exit 1
  fi

  if ! smoke_check; then
    log "Smoke checks failed."
    rollback_deploy
    exit 1
  fi

  rm -f "$PREVIOUS_DB"
  log "OPUS DB auto-refresh completed successfully."
}

main "$@"
