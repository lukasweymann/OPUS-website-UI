import os
import sys
import json
import sqlite3

def get_conn():
    db_path = os.environ.get("LANGPAIRS_DB")
    if not db_path:
        print(json.dumps({"error": "missing_LANGPAIRS_DB_env"}))
        sys.exit(1)
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn

def handle_items(params):
    name      = params.get("name")
    version   = params.get("version")
    lang_pair = params.get("lang_pair")
    src       = params.get("src")
    tgt       = params.get("tgt")

    clauses = []
    args = []

    if name:
        clauses.append("name = ?")
        args.append(name)
    if version:
        clauses.append("version = ?")
        args.append(version)
    if lang_pair:
        clauses.append("lang_pair = ?")
        args.append(lang_pair)
    if src:
        clauses.append("src_lang = ?")
        args.append(src.lower())
    if tgt:
        clauses.append("tgt_lang = ?")
        args.append(tgt.lower())

    where = ("WHERE " + " AND ".join(clauses)) if clauses else ""
    sql = f"""
      SELECT id, name, version, lang_pair, src_lang, tgt_lang,
             alignments, files, src_tokens, tgt_tokens,
             downloads, updated_at
      FROM langpairs
      {where}
      ORDER BY name, version, lang_pair
    """

    conn = get_conn()
    try:
        cur = conn.cursor()
        cur.execute(sql, args)
        rows = cur.fetchall()

        items = []
        for r in rows:
            downloads_raw = r["downloads"]
            try:
                downloads = json.loads(downloads_raw) if downloads_raw else {}
            except Exception:
                downloads = {}
            items.append(
                {
                    "id": r["id"],
                    "name": r["name"],
                    "version": r["version"],
                    "lang_pair": r["lang_pair"],
                    "src_lang": r["src_lang"],
                    "tgt_lang": r["tgt_lang"],
                    "alignments": r["alignments"],
                    "files": r["files"],
                    "src_tokens": r["src_tokens"],
                    "tgt_tokens": r["tgt_tokens"],
                    "downloads": downloads,
                    "updated_at": r["updated_at"],
                }
            )

        return {"count": len(items), "items": items}
    finally:
        conn.close()

def handle_collections(params):
    name = params.get("name")

    conn = get_conn()
    try:
        cur = conn.cursor()

        if name:
            # Equivalent to:
            # SELECT array_agg(DISTINCT version ORDER BY version) AS versions FROM langpairs WHERE name = %s
            cur.execute(
                "SELECT DISTINCT version FROM langpairs WHERE name = ? ORDER BY version",
                (name,),
            )
            versions = [r["version"] for r in cur.fetchall()]
            return {"name": name, "versions": versions}

        # All collections
        cur.execute(
            "SELECT name, version FROM langpairs ORDER BY name, version"
        )
        rows = cur.fetchall()

        collections = {}
        for r in rows:
            n = r["name"]
            v = r["version"]
            collections.setdefault(n, []).append(v)

        out = [
            {"name": n, "versions": sorted(set(vs))}
            for n, vs in collections.items()
        ]
        out.sort(key=lambda x: x["name"])
        return {"count": len(out), "collections": out}
    finally:
        conn.close()

def handle_languages(params):
    name    = params.get("name")
    version = params.get("version")

    clauses = []
    args = []

    if name:
        clauses.append("name = ?")
        args.append(name)
    if version:
        clauses.append("version = ?")
        args.append(version)

    where = ("WHERE " + " AND ".join(clauses)) if clauses else ""

    sql = f"""
      SELECT lang FROM (
        SELECT DISTINCT src_lang AS lang FROM langpairs {where}
        UNION
        SELECT DISTINCT tgt_lang AS lang FROM langpairs {where}
      ) AS u
      ORDER BY lang
    """

    # need params twice (for both SELECTs) if we have a WHERE
    all_params = args + args if clauses else []

    conn = get_conn()
    try:
        cur = conn.cursor()
        cur.execute(sql, all_params)
        langs = [r["lang"] for r in cur.fetchall()]
        return {"count": len(langs), "languages": langs}
    finally:
        conn.close()

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "missing_params"}))
        sys.exit(1)

    try:
        params = json.loads(sys.argv[1])
    except Exception as e:
        print(json.dumps({"error": "bad_json", "details": str(e)}))
        sys.exit(1)

    mode = params.get("mode") or "items"

    if mode == "items":
        out = handle_items(params)
    elif mode == "collections":
        out = handle_collections(params)
    elif mode == "languages":
        out = handle_languages(params)
    else:
        out = {"error": f"unknown_mode_{mode}"}

    print(json.dumps(out, ensure_ascii=False))

if __name__ == "__main__":
    main()
