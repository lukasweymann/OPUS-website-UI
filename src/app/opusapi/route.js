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
      { error: "python_failed" },
      { status: 500 }
    );
  }
}
