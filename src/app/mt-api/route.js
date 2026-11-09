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
                query: "catalog=External&score_type=comet&langpair=eng-deu&limit=10",
                aria: "Open top COMET scores example",
            },
            {
                label: "BLEU scores for a specific testset",
                pills: ["score_type", "testset", "limit"],
                query: "score_type=bleu&testset=newstest2021&limit=10",
                aria: "Open BLEU scores for a testset example",
            },
            {
                label: "Evaluation scores for one language pair",
                pills: ["langpair", "limit"],
                query: "langpair=fin-swe&limit=25",
                aria: "Open language pair scores example",
            },
            {
                label: "Constrain by catalog, metric and testset",
                pills: ["catalog", "score_type", "testset", "limit"],
                query: "catalog=OPUS&score_type=chrf&testset=flores200-devtest&limit=50",
                aria: "Open constrained scores example",
            },
        ];
        const exampleHtml = examples
            .map((example) => {
                const displayHref = `${base}?${example.query}`;
                const testHref = `/mt-api?${example.query}`;
                const pills = example.pills
                    .map((pill) => `<span class="pill">${escapeHtml(pill)}</span>`)
                    .join("");

                return `<div class="example-block">
                <div class="example-label">${escapeHtml(example.label)}</div>
                <div class="pill-row">${pills}</div>
                <div class="code-action">
                  <div class="code">${escapeHtml(displayHref)}</div>
                  <a class="example-link" href="${escapeHtml(testHref)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(example.aria)}">↗</a>
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
                <p class="param-desc">Optional language pair code, e.g. <b>eng-deu</b>, <b>fin-swe</b>.</p>
              </div>
              <div class="param">
                <span class="param-name">testset</span>
                <p class="param-desc">Optional testset identifier, e.g. <b>newstest2021</b>, <b>flores200-devtest</b>.</p>
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
            { error: "scores_failed" },
            { status: 500 }
        );
    }
}
