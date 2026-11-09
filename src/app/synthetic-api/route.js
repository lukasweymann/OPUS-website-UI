import { NextResponse } from "next/server";
import { withApiDocsChrome } from "@/lib/apiDocsShell";

export const runtime = "nodejs";

export async function GET() {
    const base = "https://opus.nlpl.eu/synthetic-api";
    const escapeHtml = (value) =>
        value
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;");
    const examples = [
        {
            label: "All synthetic language-pair items",
            pills: ["items"],
            path: "/items",
            aria: "Open all synthetic items example",
        },
        {
            label: "Items for a collection",
            pills: ["items", "name"],
            path: "/items?name=Europarl",
            aria: "Open collection items example",
        },
        {
            label: "A specific version and language pair",
            pills: ["items", "name", "version", "lang_pair"],
            path: "/items?name=Europarl&version=v8syn&lang_pair=bg-mk",
            aria: "Open language pair items example",
        },
        {
            label: "Filter items by source and target",
            pills: ["items", "name", "src", "tgt"],
            path: "/items?name=Europarl&src=bg&tgt=mk",
            aria: "Open source and target filter example",
        },
        {
            label: "All synthetic collections",
            pills: ["collections"],
            path: "/collections",
            aria: "Open collections example",
        },
        {
            label: "Versions for one collection",
            pills: ["collections", "name"],
            path: "/collections?name=Europarl",
            aria: "Open collection versions example",
        },
        {
            label: "Languages for a collection version",
            pills: ["languages", "name", "version"],
            path: "/languages?name=Europarl&version=v8syn",
            aria: "Open collection languages example",
        },
    ];
    const exampleHtml = examples
        .map((example) => {
            const href = `${base}${example.path}`;
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
  <title>Synthetic corpus API</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body>
  <div class="shell">
    <div class="docs">
      <div class="docs-inner">
        <div class="badge">
          <span class="badge-dot"></span>
          <span>Synthetic API • HTTP interface</span>
        </div>
        <h1>Synthetic corpus API endpoint</h1>
        <p class="subtitle">
          Explore synthetic corpus collections, versions, language pairs and statistics with simple URL paths and filters.
        </p>
        <div class="endpoint-line">
          <span class="method">GET</span>
          <code>/synthetic-api/{items|collections|languages}</code>
        </div>

        <div class="grid">
          <section>
            <h2 class="section-title">Endpoint paths</h2>
            <div class="param-list">
              <div class="param">
                <span class="param-name">items</span>
                <p class="param-desc">Language-pair rows and statistics from synthetic corpus releases.</p>
              </div>
              <div class="param">
                <span class="param-name">collections</span>
                <p class="param-desc">Available synthetic collections and their versions.</p>
              </div>
              <div class="param">
                <span class="param-name">languages</span>
                <p class="param-desc">Distinct language codes, optionally narrowed by collection and version.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 class="section-title">Query filters</h2>
            <div class="param-list">
              <div class="param">
                <span class="param-name">name</span>
                <p class="param-desc">Optional collection name, e.g. <b>Europarl</b> or <b>Wikibooks</b>.</p>
              </div>
              <div class="param">
                <span class="param-name">version</span>
                <p class="param-desc">Optional synthetic release version, e.g. <b>v8syn</b> or <b>v1syn</b>.</p>
              </div>
              <div class="param">
                <span class="param-name">lang_pair</span>
                <p class="param-desc">Optional pair code, e.g. <b>bg-mk</b>.</p>
              </div>
              <div class="param">
                <span class="param-name">src</span>
                <p class="param-desc">Optional source language code.</p>
              </div>
              <div class="param">
                <span class="param-name">tgt</span>
                <p class="param-desc">Optional target language code.</p>
              </div>
            </div>
            <p class="muted">
              Filters can be combined to narrow the returned collection, version or language-pair rows.
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
</html>`, { page: "synthetic-api" });

    return new NextResponse(html, {
        status: 200,
        headers: {
            "Content-Type": "text/html; charset=utf-8",
        },
    });
}
