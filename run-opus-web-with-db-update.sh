#!/usr/bin/env bash
set -euo pipefail

# UPDATE_DB="${UPDATE_DB:-0}"
UPDATE_DB=1
HOST_DB_DIR="./data/opus"
HOST_DB="$HOST_DB_DIR/opusdata.db"
BOOTSTRAP_IMAGE="opus-dbtools:latest"

mkdir -p "$HOST_DB_DIR"

echo "Building DB tools image..."
docker build -f Dockerfile.dbtools -t "$BOOTSTRAP_IMAGE" .

if [ ! -f "$HOST_DB" ]; then
  echo "Host OPUS DB not found. Seeding it..."
  docker run --rm \
    -v "$(pwd)/data/opus:/data/opus" \
    "$BOOTSTRAP_IMAGE" \
    /bin/bash -lc '
      set -euo pipefail
      mkdir -p /data/opus
      /opt/pyenv/bin/opus_get -l -d RF -s en -t sv --local_db
      cp /root/.OpusTools/opusdata.db /data/opus/opusdata.db
    '
else
  echo "Host OPUS DB already exists. Skipping seed."
fi

if [ "$UPDATE_DB" = "1" ]; then
  echo "Updating host OPUS DB..."
  docker run --rm \
    -v "$(pwd)/data/opus:/data/opus" \
    "$BOOTSTRAP_IMAGE" \
    /bin/bash -lc '
      set -euo pipefail
      /opt/pyenv/bin/opus_get -u -db /data/opus/opusdata.db --suppress_prompts
    '
else
  echo "Skipping host OPUS DB update."
fi

echo "Starting app build and run..."
docker compose up --build -d
