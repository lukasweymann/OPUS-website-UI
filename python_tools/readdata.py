import os
import sys
import json

from opustools import DbOperations


def main() -> None:
    if len(sys.argv) < 2:
        print(json.dumps({"error": "missing_params"}))
        sys.exit(1)

    raw = sys.argv[1]
    try:
        params = json.loads(raw)
    except Exception as e:
        print(json.dumps({"error": "bad_json", "details": str(e)}))
        sys.exit(1)

    db_path = os.environ.get("OPUSAPI_DB")
    if not db_path:
        print(json.dumps({"error": "missing_OPUSAPI_DB_env"}))
        sys.exit(1)

    dbo = DbOperations(db_file=db_path)

    if params.get("versions") == "True":
        corpus = params.get("corpus")
        where = " WHERE corpus = ?" if corpus else ""
        _, rows = dbo.run_query(
            "SELECT corpus, version, MAX(latest = 'True') AS is_latest "
            "FROM opusfile" + where + " GROUP BY corpus, version "
            "ORDER BY corpus, is_latest DESC, version DESC",
            [corpus] if corpus else [],
        )
        print(json.dumps({"versions": [
            {"corpus": row["corpus"], "version": row["version"],
             "latest": bool(row["is_latest"])} for row in rows
        ]}))
        return

    parameters = dbo.clean_up_parameters(params)

    if len(parameters) == 0:
        print(json.dumps({"error": "no_parameters"}))
        sys.exit(0)

    if "corpora" in parameters:
        result = {"corpora": dbo.run_corpora_query(parameters)}
    elif "languages" in parameters:
        result = {"languages": dbo.run_languages_query(parameters)}
    else:
        result = {"corpora": dbo.get_corpora(parameters)}

    print(json.dumps(result, default=str))


if __name__ == "__main__":
    main()
