import { NextResponse } from "next/server";
import { callPythonReadData } from "@/lib/pythonClient";
import { withApiDocsChrome } from "@/lib/apiDocsShell";

export const runtime = "nodejs";

export async function GET(req) {
  const url = new URL(req.url);
  const searchParams = url.searchParams;

  const hasQueryParams = [...searchParams.keys()].length > 0;

  // If no query parameters: show the docs page (HTML)
  if (!hasQueryParams) {
    const base = `https://opus.nlpl.eu/opusapi`;

    const html = withApiDocsChrome(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>OPUS-API</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    :root {
      --bg: #020617;
      --card-bg: #020617;
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
    .param:last-child { border-bottom: 1px solid color-mix(in oklab, var(--border) 70%, transparent); }
    .param-name {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
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
    .example-block:last-child { border-bottom: 1px solid color-mix(in oklab, var(--border) 70%, transparent); }
    .example-label {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: var(--text-muted);
      margin-bottom: 0.45rem;
    }
    .code {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
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
          <span>OPUS-API • HTTP interface</span>
        </div>
        <h1>OPUS API endpoint</h1>
        <p class="subtitle">
          Query OPUS corpora and languages using simple URL parameters. Call this endpoint directly from your code, or explore it in the browser.
        </p>

        <div class="grid">
          <section>
            <h2 class="section-title">Query parameters</h2>
            <div class="param-list">
              <div class="param">
                <span class="param-name">corpus</span>
                <p class="param-desc">
                  Name of the corpus you want to query. For example:
                  <b>OpenSubtitles</b>.
                </p>
              </div>
              <div class="param">
                <span class="param-name">source</span>
                <p class="param-desc">
                  Source language code (e.g. <b>en</b>, <b>fi</b>).
                </p>
              </div>
              <div class="param">
                <span class="param-name">target</span>
                <p class="param-desc">
                  Target language code. Combine with <b>source</b> to query language pairs.
                </p>
              </div>
              <div class="param">
                <span class="param-name">preprocessing</span>
                <p class="param-desc">
                  Preprocessing type, for example <b>xml</b>.
                </p>
              </div>
              <div class="param">
                <span class="param-name">version</span>
                <p class="param-desc">
                  Corpus version. Use <b>latest</b> to always get the latest release.
                </p>
              </div>
              <div class="param">
                <span class="param-name">corpora</span>
                <p class="param-desc">
                  Set to <b>True</b> to list available corpora instead of querying a specific one.
                </p>
              </div>
              <div class="param">
                <span class="param-name">languages</span>
                <p class="param-desc">
                  Set to <b>True</b> to list available languages, optionally filtered by corpus or source.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 class="section-title">Examples</h2>
            <div class="examples">
              <div class="example-block">
                <div class="example-label">Query corpora</div>
                <div class="pill-row">
                  <span class="pill">corpus</span>
                  <span class="pill">source</span>
                  <span class="pill">target</span>
                  <span class="pill">preprocessing</span>
                  <span class="pill">version</span>
                </div>
                <div class="code-action">
                  <div class="code">
                    ${base}?corpus=OpenSubtitles&source=en&target=fi&preprocessing=xml&version=latest
                  </div>
                  <a class="example-link" href="${base}?corpus=OpenSubtitles&amp;source=en&amp;target=fi&amp;preprocessing=xml&amp;version=latest" target="_blank" rel="noopener noreferrer" aria-label="Open query corpora example">↗</a>
                </div>
              </div>

              <div class="example-block">
                <div class="example-label">List available corpora</div>
                <div class="pill-row">
                  <span class="pill">corpora=True</span>
                </div>
                <div class="code-action">
                  <div class="code">
                    ${base}?corpora=True
                  </div>
                  <a class="example-link" href="${base}?corpora=True" target="_blank" rel="noopener noreferrer" aria-label="Open available corpora example">↗</a>
                </div>
              </div>

              <div class="example-block">
                <div class="example-label">List all languages</div>
                <div class="pill-row">
                  <span class="pill">languages=True</span>
                </div>
                <div class="code-action">
                  <div class="code">
                    ${base}?languages=True
                  </div>
                  <a class="example-link" href="${base}?languages=True" target="_blank" rel="noopener noreferrer" aria-label="Open all languages example">↗</a>
                </div>
              </div>

              <div class="example-block">
                <div class="example-label">Languages for a corpus</div>
                <div class="pill-row">
                  <span class="pill">languages=True</span>
                  <span class="pill">corpus</span>
                </div>
                <div class="code-action">
                  <div class="code">
                    ${base}?languages=True&corpus=OpenSubtitles
                  </div>
                  <a class="example-link" href="${base}?languages=True&amp;corpus=OpenSubtitles" target="_blank" rel="noopener noreferrer" aria-label="Open languages for a corpus example">↗</a>
                </div>
              </div>

              <div class="example-block">
                <div class="example-label">Target languages for a source</div>
                <div class="pill-row">
                  <span class="pill">languages=True</span>
                  <span class="pill">source</span>
                </div>
                <div class="code-action">
                  <div class="code">
                    ${base}?languages=True&source=fi
                  </div>
                  <a class="example-link" href="${base}?languages=True&amp;source=fi" target="_blank" rel="noopener noreferrer" aria-label="Open target languages for a source example">↗</a>
                </div>
              </div>

              <div class="example-block">
                <div class="example-label">Target languages for a source in a corpus</div>
                <div class="pill-row">
                  <span class="pill">languages=True</span>
                  <span class="pill">corpus</span>
                  <span class="pill">source</span>
                </div>
                <div class="code-action">
                  <div class="code">
                    ${base}?languages=True&corpus=OpenSubtitles&source=fi
                  </div>
                  <a class="example-link" href="${base}?languages=True&amp;corpus=OpenSubtitles&amp;source=fi" target="_blank" rel="noopener noreferrer" aria-label="Open target languages for a source in a corpus example">↗</a>
                </div>
              </div>
            </div>
            <p class="muted">
              All responses are returned as JSON. You can call this endpoint from curl, Python, JavaScript, or any HTTP client.
            </p>
            <p class="footer-note">
              Tip: opening <code>/opusapi/?...</code> in the browser is a quick way to explore responses while developing.
            </p>
          </section>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`, { page: "opusapi" });

    return new Response(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  }

  // If there ARE query params: behave as the JSON API (current behaviour)
  const params = {};
  searchParams.forEach((value, key) => {
    params[key] = value;
  });

  try {
    const data = await callPythonReadData(params);
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error("Error calling Python:", err);
    return NextResponse.json(
      {
        error: "python_failed",
        details: err?.message || String(err),
      },
      { status: 500 }
    );
  }
}
