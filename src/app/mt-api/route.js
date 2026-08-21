import { NextResponse } from "next/server";
import { callScoresApi } from "@/lib/scoresApiClient";
import { withApiDocsChrome } from "@/lib/apiDocsShell";

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
        const base = "https://opus.nlpl.eu/mt-api";
        const escapeHtml = (value) =>
            value
                .replaceAll("&", "&amp;")
                .replaceAll("<", "&lt;")
                .replaceAll(">", "&gt;")
                .replaceAll('"', "&quot;");
        const examples = [
            {
                label: "Top COMET scores for English-German",
                pills: ["catalog", "score_type", "langpair", "limit"],
                query: "catalog=External&score_type=comet&langpair=en-de&limit=10",
                aria: "Open top COMET scores example",
            },
            {
                label: "BLEU scores for a specific testset",
                pills: ["score_type", "testset"],
                query: "score_type=bleu&testset=WMT21",
                aria: "Open BLEU scores for a testset example",
            },
            {
                label: "Evaluation scores for one language pair",
                pills: ["langpair", "limit"],
                query: "langpair=fi-sv&limit=25",
                aria: "Open language pair scores example",
            },
            {
                label: "Constrain by catalog, metric and testset",
                pills: ["catalog", "score_type", "testset", "limit"],
                query: "catalog=OPUS&score_type=chrf&testset=WMT23&limit=50",
                aria: "Open constrained scores example",
            },
        ];
        const exampleHtml = examples
            .map((example) => {
                const href = `${base}?${example.query}`;
                const pills = example.pills
                    .map((pill) => `<span class="pill">${escapeHtml(pill)}</span>`)
                    .join("");

                return `<div class="example-block">
                <div class="example-label">${escapeHtml(example.label)}</div>
                <div class="pill-row">${pills}</div>
                <div class="code-action">
                  <div class="code">${escapeHtml(href)}</div>
                  <a class="example-link" href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(example.aria)}">↗</a>
                </div>
              </div>`;
            })
            .join("");

        const html = withApiDocsChrome(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>MT API</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    :root {
      --bg: #020617;
      --border: #1e293b;
      --accent: #8e75ffff;
      --accent-soft: rgba(120, 22, 249, 0.1);
      --text-main: #e5e7eb;
      --text-muted: #9ca3af;
      --code-bg: #020617;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
        sans-serif;
      background: radial-gradient(circle at top left, #111827, var(--bg));
      color: var(--text-main);
    }
    .shell {
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: flex-start;
      padding: 3rem 1.5rem;
    }
    .docs {
      width: 100%;
      max-width: none;
      position: relative;
    }
    .docs-inner {
      display: grid;
      gap: 1.75rem;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      border-radius: 999px;
      border: 1px solid rgba(148,163,184,0.35);
      padding: 0.15rem 0.75rem;
      font-size: 0.75rem;
      color: var(--text-muted);
      background: rgba(15,23,42,0.7);
      backdrop-filter: blur(10px);
      justify-self: start;
      width: max-content;
    }
    .badge-dot {
      width: 7px;
      height: 7px;
      border-radius: 999px;
      background: var(--accent);
      box-shadow: 0 0 0 4px var(--accent-soft);
    }
    h1 {
      margin: 0.75rem 0 0.25rem;
      font-size: 2.3rem;
      letter-spacing: 0;
    }
    .subtitle {
      margin: 0.25rem 0 0;
      padding-bottom: 0.65rem;
      font-size: 0.98rem;
      color: var(--text-muted);
      max-width: 46rem;
    }
    .endpoint-line {
      display: inline-flex;
      align-items: center;
      gap: 0.55rem;
      color: var(--text-muted);
      width: max-content;
    }
    .endpoint-line code,
    .code,
    .param-name {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
    }
    .grid {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: 2rem;
    }
    @media (max-width: 800px) {
      .grid { grid-template-columns: minmax(0, 1fr); }
      h1 { font-size: 1.9rem; }
    }
    .section-title {
      font-size: 0.9rem;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: var(--text-muted);
      margin: 0 0 0.75rem;
    }
    .param-list {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      column-gap: 2.4rem;
      row-gap: 0;
      margin: 0;
    }
    .param {
      display: grid;
      gap: 0.25rem;
      align-content: start;
      padding: 0.78rem 0;
      border-top: 1px solid color-mix(in oklab, var(--border) 70%, transparent);
    }
    .param:last-child {
      border-bottom: 1px solid color-mix(in oklab, var(--border) 70%, transparent);
    }
    .param-name {
      font-size: 0.85rem;
      padding: 0;
      border: 0;
      background: transparent;
      color: var(--accent);
      white-space: nowrap;
      justify-self: start;
      width: max-content;
    }
    .param-desc {
      margin: 0;
      font-size: 0.9rem;
      color: var(--text-muted);
    }
    .param-desc b {
      color: var(--text-main);
      font-weight: 500;
    }
    .examples {
      display: grid;
      gap: 0;
    }
    .example-block {
      padding: 1rem 0;
      border-top: 1px solid color-mix(in oklab, var(--border) 70%, transparent);
    }
    .example-block:last-child {
      border-bottom: 1px solid color-mix(in oklab, var(--border) 70%, transparent);
    }
    .example-label {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: var(--text-muted);
      margin-bottom: 0.45rem;
    }
    .method {
      display: inline-flex;
      font-size: 0.75rem;
      padding: 0.15rem 0.4rem;
      border-radius: 999px;
      background: rgba(34,197,94,0.12);
      color: #4ade80;
      font-weight: 650;
    }
    .pill-row {
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;
      margin-bottom: 0.5rem;
    }
    .pill {
      font-size: 0.76rem;
      padding: 0.12rem 0.55rem;
      border-radius: 999px;
      border: 1px solid rgba(148,163,184,0.3);
      color: var(--text-muted);
      background: rgba(15,23,42,0.85);
    }
    .code {
      font-size: 0.8rem;
      background: var(--code-bg);
      border-radius: 0.6rem;
      padding: 0.4rem 0.45rem;
      display: block;
      color: var(--text-main);
      overflow-wrap: anywhere;
      word-break: normal;
    }
    .code-action {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 2.35rem;
      gap: 0.55rem;
      align-items: start;
    }
    .example-link {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 2.35rem;
      height: 2.35rem;
      border-radius: 8px;
      border: 1px solid color-mix(in oklab, var(--accent) 54%, var(--border));
      background: color-mix(in oklab, var(--accent) 18%, transparent);
      color: var(--accent);
      text-decoration: none;
      font-size: 1rem;
      font-weight: 700;
      transition: background 160ms ease, border-color 160ms ease, color 160ms ease;
    }
    .example-link:hover,
    .example-link:focus-visible {
      background: var(--accent);
      border-color: var(--accent);
      color: #ffffff;
      outline: none;
    }
    .muted {
      color: var(--text-muted);
      font-size: 0.82rem;
      margin-top: 0.5rem;
    }
    .footer-note {
      margin: 0.75rem 0 0;
      padding-top: 0.9rem;
      border-top: 1px solid color-mix(in oklab, var(--border) 70%, transparent);
      font-size: 0.78rem;
      color: var(--text-muted);
    }
  </style>
</head>
<body>
  <div class="shell">
    <div class="docs">
      <div class="docs-inner">
        <div class="badge">
          <span class="badge-dot"></span>
          <span>MT API • HTTP interface</span>
        </div>
        <h1>MT API endpoint</h1>
        <p class="subtitle">
          Query aggregated evaluation scores such as BLEU, chrF and COMET with simple URL parameters.
        </p>
        <div class="endpoint-line">
          <span class="method">GET</span>
          <code>/mt-api</code>
        </div>

        <div class="grid">
          <section>
            <h2 class="section-title">Query parameters</h2>
            <div class="param-list">
              <div class="param">
                <span class="param-name">catalog</span>
                <p class="param-desc">Optional catalog or source name, e.g. <b>External</b>, <b>OPUS</b>, <b>Contributed</b>.</p>
              </div>
              <div class="param">
                <span class="param-name">score_type</span>
                <p class="param-desc">Optional metric, e.g. <b>chrf</b>, <b>chrf++</b>, <b>spbleu</b>, <b>bleu</b>, <b>comet</b>.</p>
              </div>
              <div class="param">
                <span class="param-name">langpair</span>
                <p class="param-desc">Optional language pair code, e.g. <b>en-de</b>, <b>fi-sv</b>.</p>
              </div>
              <div class="param">
                <span class="param-name">testset</span>
                <p class="param-desc">Optional testset identifier, e.g. <b>WMT21</b>, <b>Flores</b>.</p>
              </div>
              <div class="param">
                <span class="param-name">model</span>
                <p class="param-desc">Optional model identifier or model name.</p>
              </div>
              <div class="param">
                <span class="param-name">limit</span>
                <p class="param-desc">Optional maximum number of rows to return.</p>
              </div>
            </div>
            <p class="muted">
              Parameters are combined with logical AND in the underlying query.
            </p>
          </section>

          <section>
            <h2 class="section-title">Examples</h2>
            <div class="examples">
              ${exampleHtml}
            </div>
            <p class="footer-note">
              All responses are returned as JSON.
            </p>
          </section>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`, { page: "mt-api" });

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
        console.error("[/mt-api] error:", err);
        return NextResponse.json(
            { error: "scores_failed", details: String(err?.message || err) },
            { status: 500 }
        );
    }
}
