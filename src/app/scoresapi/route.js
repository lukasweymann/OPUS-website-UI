import { NextResponse } from "next/server";
import { callScoresApi } from "@/lib/scoresApiClient";

export const runtime = "nodejs";

export async function GET(req) {
    const url = new URL(req.url);
    const sp = url.searchParams;

    const catalog = sp.get("catalog");
    const score_type = sp.get("score_type"); // "chrf", "bleu", "comet", ...
    const langpair = sp.get("langpair");     // "en-de", "fi-sv", ...
    const testset = sp.get("testset");
    const model = sp.get("model");
    const limit = sp.get("limit");

    const hasFilters =
        catalog ||
        score_type ||
        langpair ||
        testset ||
        model ||
        limit;

    // If no filters at all -> serve HTML homepage/docs
    if (!hasFilters) {
        const base = `${url.protocol}//${url.host}/scoresapi`;

        const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Scores API</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    :root {
      color-scheme: light dark;
    }
    body {
      font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
      margin: 2rem;
      line-height: 1.5;
      color: #111827;
      background: #f9fafb;
    }
    @media (prefers-color-scheme: dark) {
      body {
        background: #020617;
        color: #e5e7eb;
      }
    }
    h1 {
      margin-bottom: 0.25rem;
      font-size: 1.75rem;
    }
    h2 {
      margin-top: 1.75rem;
      margin-bottom: 0.5rem;
      font-size: 1.25rem;
    }
    code, a {
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    }
    .card {
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 1rem 1.25rem;
      margin: 1rem 0;
      background: #ffffff;
      box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
    }
    @media (prefers-color-scheme: dark) {
      .card {
        background: #020617;
        border-color: #1f2937;
        box-shadow: 0 1px 2px rgba(15, 23, 42, 0.8);
      }
    }
    .muted {
      color: #6b7280;
      font-size: 0.95rem;
    }
    @media (prefers-color-scheme: dark) {
      .muted {
        color: #9ca3af;
      }
    }
    ul {
      padding-left: 1.25rem;
    }
    li {
      margin: 0.15rem 0;
    }
    a {
      color: #2563eb;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
    .endpoint {
      font-weight: 500;
    }
    .method {
      display: inline-block;
      font-size: 0.75rem;
      padding: 0.15rem 0.4rem;
      border-radius: 999px;
      background: #ecfdf5;
      color: #15803d;
      margin-right: 0.4rem;
    }
    @media (prefers-color-scheme: dark) {
      .method {
        background: #052e16;
        color: #4ade80;
      }
    }
    .tag {
      display: inline-block;
      font-size: 0.7rem;
      padding: 0.15rem 0.45rem;
      border-radius: 999px;
      background: #eff6ff;
      color: #1d4ed8;
      margin-right: 0.25rem;
      margin-top: 0.1rem;
    }
    @media (prefers-color-scheme: dark) {
      .tag {
        background: #111827;
        color: #60a5fa;
      }
    }
    .code-block {
      font-size: 0.8rem;
      background: #0b1120;
      color: #e5e7eb;
      padding: 0.75rem 0.9rem;
      border-radius: 8px;
      overflow-x: auto;
      margin-top: 0.5rem;
    }
    .code-block span.method {
      background: transparent;
      color: #4ade80;
      font-weight: 600;
      padding: 0;
      margin: 0;
    }
  </style>
</head>
<body>
  <h1>Scores API</h1>
  <p class="muted">
    Read-only API over aggregated evaluation scores (e.g. BLEU, chrF, COMET) collected from multiple SQLite files.
  </p>

  <div class="card">
    <h2>Endpoint</h2>
    <p>
      <span class="method">GET</span>
      <code>/scoresapi</code>
    </p>
    <p class="muted">
      Returns JSON with a list of score entries. You can filter by catalog, metric type, language pair,
      testset and model.
    </p>
    <p class="muted">
      Response shape:
    </p>
    <div class="code-block">
<pre>{
  "count": &lt;number&gt;,
  "scores": [
    {
      "model": "my-model-name",
      "langpair": "en-de",
      "testset": "WMT21",
      "score": 0.32,
      "catalog": "External",
      "score_type": "comet",
      "date": "2024-06-01"
    },
    ...
  ]
}</pre>
    </div>
  </div>

  <div class="card">
    <h2>Query parameters</h2>
    <ul>
      <li><code>catalog</code> – optional. Catalog/source name, e.g. <code>External</code>, <code>OPUS</code>, <code>Contributed</code>.</li>
      <li><code>score_type</code> – optional. Score metric, e.g. <code>chrf</code>, <code>chrf++</code>, <code>spbleu</code>, <code>bleu</code>, <code>comet</code>.</li>
      <li><code>langpair</code> – optional. Language pair code, e.g. <code>en-de</code>, <code>fi-sv</code>.</li>
      <li><code>testset</code> – optional. Testset identifier, e.g. <code>WMT21</code>, <code>Flores</code>.</li>
      <li><code>model</code> – optional. Model identifier/name.</li>
      <li><code>limit</code> – optional. Max number of rows to return (integer).</li>
    </ul>
    <p class="muted">
      All parameters are combined with logical AND in the underlying query.
    </p>
  </div>

  <div class="card">
    <h2>Examples</h2>
    <ul>
      <li>
        <span class="endpoint">Top COMET scores for <code>en-de</code> in the <code>External</code> catalog:</span><br />
        <a href="${base}?catalog=External&amp;score_type=comet&amp;langpair=en-de&amp;limit=10">
          ${base}?catalog=External&amp;score_type=comet&amp;langpair=en-de&amp;limit=10
        </a>
      </li>
      <li>
        <span class="endpoint">All BLEU scores for a specific testset:</span><br />
        <a href="${base}?score_type=bleu&amp;testset=WMT21">
          ${base}?score_type=bleu&amp;testset=WMT21
        </a>
      </li>
      <li>
        <span class="endpoint">Scores for a given model across all pairs:</span><br />
        <a href="${base}?model=my-model-name">
          ${base}?model=my-model-name
        </a>
      </li>
      <li>
        <span class="endpoint">Constrained to catalog + metric + testset:</span><br />
        <a href="${base}?catalog=OPUS&amp;score_type=chrf&amp;testset=WMT23&amp;limit=50">
          ${base}?catalog=OPUS&amp;score_type=chrf&amp;testset=WMT23&amp;limit=50
        </a>
      </li>
    </ul>

    <p class="muted">
      Example <code>curl</code>:
    </p>
    <div class="code-block">
<pre><span class="method">GET</span> curl "${base}?catalog=External&amp;score_type=comet&amp;langpair=en-de&amp;limit=5"</pre>
    </div>
  </div>

  <p class="muted">
    Base URL (local): <code>${base}</code>
  </p>
</body>
</html>`;

        return new NextResponse(html, {
            status: 200,
            headers: {
                "Content-Type": "text/html; charset=utf-8",
            },
        });
    }

    // --- JSON API mode (filters present) ---
    try {
        const data = await callScoresApi("scores", {
            catalog,
            score_type,
            langpair,
            testset,
            model,
            limit,
        });

        return NextResponse.json(data, { status: 200 });
    } catch (err) {
        console.error("[/scoresapi] error:", err);
        return NextResponse.json(
            { error: "scores_failed", details: String(err?.message || err) },
            { status: 500 }
        );
    }
}
