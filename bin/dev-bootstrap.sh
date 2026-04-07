#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="/home/lukas/Desktop/OPUS-Web"

cd "$PROJECT_ROOT"

echo "==> 1. Python venv"
if [ ! -d ".venv" ]; then
  python3 -m venv .venv
fi

# shellcheck disable=SC1091
source .venv/bin/activate
python -m pip install --upgrade pip

echo "==> 2. Python deps (db_scores + tools)"
pip install -r db_scores/requirements.txt
pip install \
  "git+https://github.com/lukasweymann/OpusTools.git@master#egg=opustools&subdirectory=opustools_pkg" \
  ruamel.yaml \
  PyYAML \
  requests

echo "==> 3. (Optional) OPUS dev DB (opusdata.db) – skip if already built"
if [ ! -f "dev-opus/opusdata.db" ]; then
  opus_get -l -d RF -s en -t sv --local_db
  # opus_get -u -db ~/.OpusTools/opusdata.db --suppress_prompts
  mkdir -p dev-opus
  cp ~/.OpusTools/opusdata.db dev-opus/opusdata.db
fi

echo "==> 4. Synthetic/langpairs dev DB"
export LANGPAIRS_DB_PATH="$PROJECT_ROOT/dev-langpairs.db"
export GIT_REPO_URL="${GIT_REPO_URL:-https://github.com/Helsinki-NLP/synOPUS.git}"
export GIT_BRANCH="${GIT_BRANCH:-main}"
export ROOT_SUBDIR="${ROOT_SUBDIR:-corpus}"
export YAML_FILENAME="${YAML_FILENAME:-statistics.yaml}"
export TOP_KEY="${TOP_KEY:-bitexts}"

python python_tools/langpairs_ingest_sqlite.py

echo "==> 5. Scores dev DB"
export SCORES_DB_PATH="$PROJECT_ROOT/dev-scores.db"
export SCORES_CATALOGS="${SCORES_CATALOGS:-External OPUS Contributed}"

python python_tools/scores_ingest_sqlite.py

echo "==> 6. .env.local"
ENV_FILE="$PROJECT_ROOT/.env.local"

cat > "$ENV_FILE" <<EOF
PYTHON_BIN=$PROJECT_ROOT/.venv/bin/python

OPUSAPI_DB=$PROJECT_ROOT/dev-opus/opusdata.db
LANGPAIRS_DB=$PROJECT_ROOT/dev-langpairs.db
SCORES_DB=$PROJECT_ROOT/dev-scores.db
EOF

echo "Wrote .env.local:"
cat "$ENV_FILE"

echo "==> 7. Node deps (pnpm install)"
pnpm install

echo
echo "Bootstrap done ✅"
echo "Now run:"
echo "  cd $PROJECT_ROOT"
echo "  source .venv/bin/activate"
echo "  pnpm dev"
