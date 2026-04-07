import os
import sys
import json
import sqlite3
import pathlib
import subprocess

import requests

# ---- Config ----

# Where to write the aggregated SQLite database
SCORES_DB_PATH = os.environ.get("SCORES_DB_PATH", "/opt/scores/scores.db").strip()

# This mirrors your original shell:
#   CATALOG="External OPUS Contributed"
#   for i in $CATALOG; do ...
# Env is space-separated -> ["External", "OPUS", "Contributed"]
CATALOG_ENV = os.environ.get("SCORES_CATALOGS", "External OPUS Contributed")
CATALOGS = CATALOG_ENV.split()

SCORE_TYPES = ["chrf", "chrf++", "spbleu", "bleu", "comet"]

URL_PREFIX = "https://raw.githubusercontent.com/Helsinki-NLP/"
URL_INFIX = "-MT-leaderboard/master/scores/"
URL_SUFFIX = "_scores"

SCHEMA_SQL = """
CREATE TABLE IF NOT EXISTS scores (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    model     TEXT,
    langpair  TEXT,
    testset   TEXT,
    score     REAL,
    catalog   TEXT,
    score_type TEXT,
    date      TEXT
);

CREATE INDEX IF NOT EXISTS idx_scores_testset   ON scores(testset);
CREATE INDEX IF NOT EXISTS idx_scores_model     ON scores(model);
CREATE INDEX IF NOT EXISTS idx_scores_langpair  ON scores(langpair);
CREATE INDEX IF NOT EXISTS idx_scores_catalog   ON scores(catalog);
CREATE INDEX IF NOT EXISTS idx_scores_cat_type  ON scores(catalog, score_type);
"""


def ensure_schema(conn: sqlite3.Connection) -> None:
    conn.executescript(SCHEMA_SQL)
    conn.commit()


def clear_scores(conn: sqlite3.Connection) -> None:
    conn.execute("DELETE FROM scores")
    conn.commit()


def fetch_text(url: str) -> str:
    resp = requests.get(url, timeout=60)
    resp.raise_for_status()
    return resp.text.strip()


def parse_sqlite_url_to_rows(db_url: str, catalog: str, score_type: str, date_str: str):
    """
    Call your existing sqlitetojson.py script with the REMOTE URL,
    exactly like the original shell pipeline:

      python3 sqlitetojson.py "$MYURL_DB"
    """
    script_path = pathlib.Path(__file__).with_name("sqlitetojson.py")
    if not script_path.is_file():
        raise RuntimeError(
            f"sqlitetojson.py not found next to scores_ingest_sqlite.py (expected at: {script_path})"
        )

    proc = subprocess.run(
        [sys.executable, str(script_path), db_url],
        capture_output=True,
        text=True,
        check=False,  # do not crash on non-zero, handle manually
    )

    if proc.returncode != 0:
        print(
            f"sqlitetojson.py failed for {db_url} "
            f"(rc={proc.returncode}): {proc.stderr.strip()}",
            file=sys.stderr,
        )
        return []

    raw = (proc.stdout or "").strip()
    rows = []

    if not raw:
        return rows

    def annotate_and_push(obj):
        if not isinstance(obj, dict):
            return
        item = dict(obj)
        item["catalog"] = catalog
        item["score_type"] = score_type
        item["date"] = date_str
        rows.append(item)

    # Try: one big JSON structure
    try:
        data = json.loads(raw)
        if isinstance(data, list):
            # Could be [dict, dict, ...] or [[dict, ...], ...]
            for outer in data:
                if isinstance(outer, dict):
                    annotate_and_push(outer)
                elif isinstance(outer, list):
                    for inner in outer:
                        annotate_and_push(inner)
        elif isinstance(data, dict):
            # Could be {table_name: [dict, ...], ...}
            for v in data.values():
                if isinstance(v, dict):
                    annotate_and_push(v)
                elif isinstance(v, list):
                    for inner in v:
                        annotate_and_push(inner)
    except json.JSONDecodeError:
        # Fallback: newline-delimited JSON (just in case)
        for line in raw.splitlines():
            line = line.strip()
            if not line:
                continue
            try:
                obj = json.loads(line)
            except json.JSONDecodeError:
                continue
            annotate_and_push(obj)

    return rows


def main():
    os.makedirs(os.path.dirname(SCORES_DB_PATH), exist_ok=True)
    conn = sqlite3.connect(SCORES_DB_PATH)
    try:
        ensure_schema(conn)
        clear_scores(conn)

        total_rows = 0

        for catalog in CATALOGS:
            for score_type in SCORE_TYPES:
                url_db = f"{URL_PREFIX}{catalog}{URL_INFIX}{score_type}{URL_SUFFIX}.db"
                url_date = f"{URL_PREFIX}{catalog}{URL_INFIX}{score_type}{URL_SUFFIX}.date"

                # HEAD check like your original script
                try:
                    head = requests.head(url_db, timeout=30, allow_redirects=True)
                    if head.status_code >= 400:
                        print(f"{url_db} not found -- skipping", file=sys.stderr)
                        continue
                except Exception as e:
                    print(f"HEAD failed for {url_db} -- skipping ({e})", file=sys.stderr)
                    continue

                print(f"Processing {url_db}", file=sys.stderr)

                try:
                    date_str = fetch_text(url_date)
                except Exception as e:
                    print(f"Could not fetch date from {url_date}: {e}", file=sys.stderr)
                    date_str = None

                rows = []
                try:
                    rows = parse_sqlite_url_to_rows(url_db, catalog, score_type, date_str)
                except Exception as e:
                    print(f"Parsing failed for {url_db}: {e}", file=sys.stderr)
                    rows = []

                if not rows:
                    continue

                for r in rows:
                    score_val = r.get("score")
                    if score_val == "":
                        score_val = None

                    conn.execute(
                        """
                        INSERT INTO scores
                          (model, langpair, testset, score, catalog, score_type, date)
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                        """,
                        (
                            r.get("model"),
                            r.get("langpair"),
                            r.get("testset"),
                            score_val,
                            r.get("catalog"),
                            r.get("score_type"),
                            r.get("date"),
                        ),
                    )
                conn.commit()
                total_rows += len(rows)

        print(f"Ingestion complete: {total_rows} rows into {SCORES_DB_PATH}")
    finally:
        conn.close()


if __name__ == "__main__":
    main()
