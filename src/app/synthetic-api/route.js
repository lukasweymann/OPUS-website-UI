import { NextResponse } from "next/server";
import { withApiDocsChrome } from "@/lib/apiDocsShell";

export const runtime = "nodejs";

export async function GET(req) {
    const url = new URL(req.url);
    const base = `${url.protocol}//${url.host}/synthetic-api`;

    const html = withApiDocsChrome(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Synthetic corpus API</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    body {
      font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
      margin: 2rem;
      line-height: 1.5;
      color: #111827;
      background: #f9fafb;
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
    .muted {
      color: #6b7280;
      font-size: 0.95rem;
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
  </style>
</head>
<body>
  <h1>Synthetic corpus API</h1>
  <p class="muted">
    Endpoints to explore synthetic corpus collections, language pairs and statistics.
  </p>

  <div class="card">
    <h2>Items</h2>
    <p class="muted">
      Query individual language pairs and their statistics from the <code>langpairs</code> table.
    </p>
    <ul>
      <li>
        <span class="endpoint">All items (limited by backend):</span><br />
        <a href="${base}/items">
          ${base}/items
        </a>
      </li>
      <li>
        <span class="endpoint">Filter by collection name:</span><br />
        <a href="${base}/items?name=anotherFolderName">
          ${base}/items?name=anotherFolderName
        </a>
      </li>
      <li>
        <span class="endpoint">Filter by name + version:</span><br />
        <a href="${base}/items?name=anotherFolderName&amp;version=v1">
          ${base}/items?name=anotherFolderName&amp;version=v1
        </a>
      </li>
      <li>
        <span class="endpoint">Filter by name + version + lang_pair:</span><br />
        <a href="${base}/items?name=anotherFolderName&amp;version=v1&amp;lang_pair=bg-eu">
          ${base}/items?name=anotherFolderName&amp;version=v1&amp;lang_pair=bg-eu
        </a>
      </li>
      <li>
        <span class="endpoint">Filter by src/tgt codes:</span><br />
        <a href="${base}/items?name=anotherFolderName&amp;src=bg&amp;tgt=eu">
          ${base}/items?name=anotherFolderName&amp;src=bg&amp;tgt=eu
        </a>
      </li>
    </ul>
    <p class="muted">
      Adjust <code>name</code>, <code>version</code>, <code>lang_pair</code>, <code>src</code>, and <code>tgt</code>
      to match your corpus.
    </p>
  </div>

  <div class="card">
    <h2>Collections</h2>
    <p class="muted">
      Inspect available collections and their versions.
    </p>
    <ul>
      <li>
        <span class="endpoint">All collections:</span><br />
        <a href="${base}/collections">
          ${base}/collections
        </a>
      </li>
      <li>
        <span class="endpoint">Versions for a single collection:</span><br />
        <a href="${base}/collections?name=anotherFolderName">
          ${base}/collections?name=anotherFolderName
        </a>
      </li>
    </ul>
  </div>

  <div class="card">
    <h2>Languages</h2>
    <p class="muted">
      Get distinct language codes across all pairs, optionally filtered by collection and version.
    </p>
    <ul>
      <li>
        <span class="endpoint">All languages:</span><br />
        <a href="${base}/languages">
          ${base}/languages
        </a>
      </li>
      <li>
        <span class="endpoint">Languages for a collection:</span><br />
        <a href="${base}/languages?name=anotherFolderName">
          ${base}/languages?name=anotherFolderName
        </a>
      </li>
      <li>
        <span class="endpoint">Languages for collection + version:</span><br />
        <a href="${base}/languages?name=anotherFolderName&amp;version=v1">
          ${base}/languages?name=anotherFolderName&amp;version=v1
        </a>
      </li>
    </ul>
  </div>

  <p class="muted">
    Base URL (local): <code>${base}</code>
  </p>
</body>
</html>`);

    return new NextResponse(html, {
        status: 200,
        headers: {
            "Content-Type": "text/html; charset=utf-8",
        },
    });
}
