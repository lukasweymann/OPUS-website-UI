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
