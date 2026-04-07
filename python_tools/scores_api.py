import os
import sys
import json
import sqlite3


def open_db():
  path = os.environ.get("SCORES_DB") or os.environ.get("SCORES_DB_PATH")
  if not path:
      raise RuntimeError("SCORES_DB (or SCORES_DB_PATH) env var is not set")
  conn = sqlite3.connect(path)
  conn.row_factory = sqlite3.Row
  return conn


def handle_scores(conn, params):
  """
  Generic filter endpoint: returns raw rows.
  Params:
    - catalog, score_type, langpair, testset, model, limit
  """
  catalog = params.get("catalog")
  score_type = params.get("score_type")
  langpair = params.get("langpair")
  testset = params.get("testset")
  model = params.get("model")
  limit = params.get("limit")

  sql = """
    SELECT
      model,
      langpair,
      testset,
      score,
      catalog,
      score_type,
      date
    FROM scores
  """
  clauses = []
  args = []

  if catalog:
      clauses.append("catalog = ?")
      args.append(catalog)
  if score_type:
      clauses.append("score_type = ?")
      args.append(score_type)
  if langpair:
      clauses.append("langpair = ?")
      args.append(langpair)
  if testset:
      clauses.append("testset = ?")
      args.append(testset)
  if model:
      clauses.append("model = ?")
      args.append(model)

  if clauses:
      sql += " WHERE " + " AND ".join(clauses)

  sql += " ORDER BY score DESC, model, testset"

  lim = None
  if isinstance(limit, (int, float)) or (isinstance(limit, str) and limit.isdigit()):
      lim = int(limit)
  if lim is not None and lim > 0:
      sql += " LIMIT ?"
      args.append(lim)

  cur = conn.cursor()
  cur.execute(sql, args)
  rows = cur.fetchall()

  return {
      "count": len(rows),
      "items": [dict(r) for r in rows],
  }


def handle_max_by_testset(conn, params):
  """
  For each testset in a (langpair, score_type, catalog), return the row with
  the maximum score.

  Params:
    - langpair (required)
    - score_type (required)
    - catalog (required)
  """
  langpair = params.get("langpair")
  score_type = params.get("score_type")
  catalog = params.get("catalog")

  if not langpair or not score_type or not catalog:
      return {
          "error": "missing_params",
          "required": ["langpair", "score_type", "catalog"],
      }

  sql = """
    SELECT
      t.testset,
      t.max_score,
      s.model,
      s.catalog
    FROM (
      SELECT testset, MAX(score) AS max_score
      FROM scores
      WHERE langpair = ? AND score_type = ? AND catalog = ?
      GROUP BY testset
    ) t
    JOIN scores s
      ON s.testset = t.testset
     AND s.score = t.max_score
     AND s.langpair = ?
     AND s.score_type = ?
     AND s.catalog = ?
    ORDER BY t.testset
  """
  args = [langpair, score_type, catalog, langpair, score_type, catalog]

  cur = conn.cursor()
  cur.execute(sql, args)
  rows = cur.fetchall()

  return {
      "count": len(rows),
      "items": [
          {
              "testset": r["testset"],
              "score": r["max_score"],
              "model": r["model"],
              "catalog": r["catalog"],
          }
          for r in rows
      ],
  }


def handle_avg_by_model(conn, params):
  """
  Average score per model, grouped by catalog, for a given (langpair, score_type).

  Params:
    - langpair (required)
    - score_type (required)
  """
  langpair = params.get("langpair")
  score_type = params.get("score_type")

  if not langpair or not score_type:
      return {
          "error": "missing_params",
          "required": ["langpair", "score_type"],
      }

  # Mirror your three catalogs in a single query
  sql = """
    SELECT
      model,
      catalog,
      AVG(score) AS avg_score
    FROM scores
    WHERE langpair = ?
      AND score_type = ?
      AND catalog IN ('OPUS', 'External', 'Contributed')
    GROUP BY catalog, model
    ORDER BY avg_score DESC
  """
  args = [langpair, score_type]

  cur = conn.cursor()
  cur.execute(sql, args)
  rows = cur.fetchall()

  return {
      "count": len(rows),
      "items": [
          {
              "model": r["model"],
              "catalog": r["catalog"],
              "avg_score": r["avg_score"],
          }
          for r in rows
      ],
  }


def handle_scores_by_testset(conn, params):
  """
  All scores for a given (langpair, score_type, testset), ordered by score desc.
  Params:
    - langpair (required)
    - score_type (required)
    - testset (required)
  """
  langpair = params.get("langpair")
  score_type = params.get("score_type")
  testset = params.get("testset")

  if not langpair or not score_type or not testset:
      return {
          "error": "missing_params",
          "required": ["langpair", "score_type", "testset"],
      }

  sql = """
    SELECT
      model,
      langpair,
      testset,
      score,
      catalog,
      score_type,
      date
    FROM scores
    WHERE langpair = ?
      AND score_type = ?
      AND testset = ?
    ORDER BY score DESC
  """
  args = [langpair, score_type, testset]

  cur = conn.cursor()
  cur.execute(sql, args)
  rows = cur.fetchall()

  return {
      "count": len(rows),
      "items": [dict(r) for r in rows],
  }


def handle_scores_by_model(conn, params):
  """
  All scores for a given (langpair, score_type, model), ordered by score desc.
  Params:
    - langpair (required)
    - score_type (required)
    - model (required)
  """
  langpair = params.get("langpair")
  score_type = params.get("score_type")
  model = params.get("model")

  if not langpair or not score_type or not model:
      return {
          "error": "missing_params",
          "required": ["langpair", "score_type", "model"],
      }

  sql = """
    SELECT
      model,
      langpair,
      testset,
      score,
      catalog,
      score_type,
      date
    FROM scores
    WHERE langpair = ?
      AND score_type = ?
      AND model = ?
    ORDER BY score DESC
  """
  args = [langpair, score_type, model]

  cur = conn.cursor()
  cur.execute(sql, args)
  rows = cur.fetchall()

  return {
      "count": len(rows),
      "items": [dict(r) for r in rows],
  }


def handle_distinct_models(conn, params):
  """
  Distinct model names for a given langpair.
  Params:
    - langpair (required)
  """
  langpair = params.get("langpair")
  if not langpair:
      return {"error": "missing_params", "required": ["langpair"]}

  sql = """
    SELECT DISTINCT model
    FROM scores
    WHERE langpair = ?
    ORDER BY model
  """
  args = [langpair]

  cur = conn.cursor()
  cur.execute(sql, args)
  rows = cur.fetchall()

  return {
      "count": len(rows),
      "models": [r["model"] for r in rows],
  }


def main():
  if len(sys.argv) < 2:
      print(json.dumps({"error": "missing_payload"}))
      sys.exit(1)

  try:
      payload = json.loads(sys.argv[1])
  except Exception as e:
      print(json.dumps({"error": "bad_json", "details": str(e)}))
      sys.exit(1)

  endpoint = payload.get("endpoint")
  params = payload.get("params") or {}

  if not endpoint:
      print(json.dumps({"error": "missing_endpoint"}))
      sys.exit(1)

  try:
      conn = open_db()
  except Exception as e:
      print(json.dumps({"error": "db_open_failed", "details": str(e)}))
      sys.exit(1)

  try:
      if endpoint == "scores":
          out = handle_scores(conn, params)
      elif endpoint == "maxByTestset":
          out = handle_max_by_testset(conn, params)
      elif endpoint == "avgByModel":
          out = handle_avg_by_model(conn, params)
      elif endpoint == "scoresByTestset":
          out = handle_scores_by_testset(conn, params)
      elif endpoint == "scoresByModel":
          out = handle_scores_by_model(conn, params)
      elif endpoint == "distinctModels":
          out = handle_distinct_models(conn, params)
      else:
          out = {"error": "unknown_endpoint", "endpoint": endpoint}

      print(json.dumps(out, ensure_ascii=False))
  finally:
      conn.close()


if __name__ == "__main__":
  main()
