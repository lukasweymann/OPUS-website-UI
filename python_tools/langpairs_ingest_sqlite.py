
import os
import sys
import json
import sqlite3
import subprocess
import tempfile
import pathlib
import yaml
from datetime import datetime

# ---------- ENV ----------
GIT_REPO_URL  = os.environ.get("GIT_REPO_URL", "").strip()
GIT_BRANCH    = os.environ.get("GIT_BRANCH", "main").strip()
ROOT_SUBDIR   = os.environ.get("ROOT_SUBDIR", "corpus").strip()
YAML_FILENAME = os.environ.get("YAML_FILENAME", "statistics.yaml").strip()
TOP_KEY       = os.environ.get("TOP_KEY", "bitexts").strip()
GITHUB_TOKEN  = os.environ.get("GITHUB_TOKEN", "").strip()
DB_PATH       = os.environ.get("LANGPAIRS_DB_PATH", "/opt/langpairs/langpairs.db").strip()

SCHEMA_SQL = """
CREATE TABLE IF NOT EXISTS langpairs (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL,
  version     TEXT NOT NULL,
  lang_pair   TEXT NOT NULL,
  src_lang    TEXT NOT NULL,
  tgt_lang    TEXT NOT NULL,
  alignments  INTEGER,
  files       INTEGER,
  src_tokens  INTEGER,
  tgt_tokens  INTEGER,
  downloads   TEXT NOT NULL,  -- JSON as text
  raw_json    TEXT NOT NULL,  -- JSON as text
  updated_at  TEXT NOT NULL,
  UNIQUE(name, version, lang_pair)
);
CREATE INDEX IF NOT EXISTS idx_lp_name_version_lang
  ON langpairs (name, version, lang_pair);
CREATE INDEX IF NOT EXISTS idx_lp_name_version
  ON langpairs (name, version);
CREATE INDEX IF NOT EXISTS idx_lp_src_tgt
  ON langpairs (src_lang, tgt_lang);
"""

def ensure_schema(conn: sqlite3.Connection) -> None:
    conn.executescript(SCHEMA_SQL)
    conn.commit()

def normalise_key(s: str) -> str:
    return s.strip().lower().replace(" ", "_")

def normalise_downloads(d):
    if not d:
        return {}
    out = {}
    for k, v in d.items():
        key = normalise_key(k)
        if v in (None, "~"):
            out[key] = None
        elif isinstance(v, dict):
            out[key] = {"size": v.get("size"), "url": v.get("url")}
        else:
            out[key] = {"size": None, "url": None}
    return out

def split_langpair(lang_pair: str):
    lp = (lang_pair or "").strip().lower()
    if "-" in lp:
        src, tgt = lp.split("-", 1)
    else:
        src, tgt = lp, ""
    return src, tgt

def upsert_langpair(conn: sqlite3.Connection, name: str, version: str, lang_pair: str, item: dict):
    alignments = item.get("alignments")
    files      = item.get("files")
    src_tokens = item.get("source language tokens")
    tgt_tokens = item.get("target language tokens")
    downloads  = normalise_downloads(item.get("downloads"))
    src_lang, tgt_lang = split_langpair(lang_pair)

    sql = """
    INSERT INTO langpairs
      (name, version, lang_pair, src_lang, tgt_lang,
       alignments, files, src_tokens, tgt_tokens,
       downloads, raw_json, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(name, version, lang_pair) DO UPDATE SET
      alignments = excluded.alignments,
      files      = excluded.files,
      src_tokens = excluded.src_tokens,
      tgt_tokens = excluded.tgt_tokens,
      downloads  = excluded.downloads,
      raw_json   = excluded.raw_json,
      updated_at = excluded.updated_at;
    """
    conn.execute(
        sql,
        (
            name,
            version,
            lang_pair,
            src_lang,
            tgt_lang,
            alignments,
            files,
            src_tokens,
            tgt_tokens,
            json.dumps(downloads, ensure_ascii=False),
            json.dumps(item, ensure_ascii=False),
            datetime.utcnow().isoformat() + "Z",
        ),
    )

def git_clone_or_pull(dest: pathlib.Path):
    url = GIT_REPO_URL
    if not url:
        print("ERROR: GIT_REPO_URL is required", file=sys.stderr)
        sys.exit(2)

    if GITHUB_TOKEN and url.startswith("https://"):
        proto, rest = url.split("://", 1)
        url = f"{proto}://{GITHUB_TOKEN}:x-oauth-basic@{rest}"

    if not (dest / ".git").exists():
        subprocess.check_call([
            "git", "clone",
            "--depth", "1",
            "--branch", GIT_BRANCH,
            url,
            str(dest),
        ])
    else:
        subprocess.check_call(["git", "-C", str(dest), "fetch", "origin", GIT_BRANCH, "--depth", "1"])
        subprocess.check_call(["git", "-C", str(dest), "checkout", GIT_BRANCH])
        subprocess.check_call(["git", "-C", str(dest), "reset", "--hard", f"origin/{GIT_BRANCH}"])

def iter_stat_yaml_files(root: pathlib.Path):
    corpus_dir = root / ROOT_SUBDIR if ROOT_SUBDIR else root
    if not corpus_dir.exists():
        return
    for name_dir in corpus_dir.iterdir():
        if not name_dir.is_dir():
            continue
        name = name_dir.name
        for version_dir in name_dir.iterdir():
            if not version_dir.is_dir():
                continue
            version = version_dir.name
            yf = version_dir / YAML_FILENAME
            if yf.is_file():
                yield (name, version, yf)

def main():
    if not GIT_REPO_URL:
        print("ERROR: GIT_REPO_URL is required", file=sys.stderr)
        sys.exit(2)

    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    try:
        ensure_schema(conn)

        with tempfile.TemporaryDirectory() as td:
            repo_dir = pathlib.Path(td) / "repo"
            git_clone_or_pull(repo_dir)

            total_pairs = 0
            total_files = 0

            for name, version, yf in iter_stat_yaml_files(repo_dir):
                total_files += 1
                with open(yf, "r", encoding="utf-8") as f:
                    data = yaml.safe_load(f) or {}

                items = None
                if isinstance(data, dict):
                    if TOP_KEY in data and isinstance(data[TOP_KEY], dict):
                        items = data[TOP_KEY]
                    elif all(isinstance(v, dict) for v in data.values()):
                        items = data

                if not isinstance(items, dict):
                    print(f"SKIP {yf}: expected mapping under key '{TOP_KEY}'", file=sys.stderr)
                    continue

                for lang_pair, item in items.items():
                    if not isinstance(item, dict):
                        continue
                    lp = str(lang_pair).strip().lower()
                    upsert_langpair(conn, name=name, version=version, lang_pair=lp, item=item)
                    total_pairs += 1

                conn.commit()

            print(
                f"Ingestion complete: {total_pairs} langpairs "
                f"from {total_files} statistics files into {DB_PATH}."
            )
    finally:
        conn.close()

if __name__ == "__main__":
    main()
