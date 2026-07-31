const SITE_HEADER = `
  <script>
    (function () {
      try {
        var stored = localStorage.getItem("theme");
        var prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
        var theme =
          stored === "light" || stored === "dark"
            ? stored
            : prefersDark
              ? "dark"
              : "light";

        document.documentElement.dataset.theme = theme;
        document.documentElement.style.colorScheme = theme;
      } catch (e) {}
    })();
  </script>
  <header class="api-docs-nav">
    <a class="api-docs-brand" href="/" aria-label="OPUS home">
      <img class="api-docs-logo" src="/logos/opus_medium.png" alt="OPUS logo" data-hide-on-theme="dark" />
      <img class="api-docs-logo" src="/logos/opus_medium-white.png" alt="OPUS logo" data-hide-on-theme="light" />
    </a>
    <nav class="api-docs-actions" aria-label="Primary navigation">
      <button class="api-docs-theme" type="button" aria-label="Toggle theme" title="Toggle theme">◐</button>
      <a class="api-docs-link" href="/contact">Contribute</a>
      <a class="api-docs-link" href="/publications">Publications</a>
      <a class="api-docs-link api-docs-secondary" href="/corpora">Corpora</a>
      <a class="api-docs-link api-docs-secondary" href="/synthetic">Synthetic</a>
      <a class="api-docs-link api-docs-primary" href="/mt?source=eng&target=fra&score=spbleu&benchmark=all&model=all">Dashboard</a>
    </nav>
  </header>
`;

const SITE_FOOTER = `
  <footer class="api-docs-footer">
    <div class="api-docs-footer-inner">
      <div class="api-docs-footer-cols">
        <section class="api-docs-footer-col">
          <a class="api-docs-footer-head" href="/OPUS-Tools">
            <h3>Tools & Info</h3>
          </a>
          <nav class="api-docs-footer-links" aria-label="Tools and info">
            <a href="https://opus.nlpl.eu/opusapi/" target="_blank" rel="noreferrer">Opus API</a>
            <a href="https://github.com/hplt-project/OpusTrainer" target="_blank" rel="noreferrer"><span>Opus</span> Trainer</a>
            <a href="https://github.com/hplt-project/OpusCleaner" target="_blank" rel="noreferrer"><span>Opus</span> Cleaner</a>
            <a href="https://opus.nlpl.eu/legacy/lex.php" target="_blank" rel="noreferrer"><span>Opus</span> Wordalign</a>
            <a href="https://github.com/Helsinki-NLP/OpusFilter" target="_blank" rel="noreferrer">Opus Filter</a>
            <a href="https://github.com/Helsinki-NLP/OPUS-translator" target="_blank" rel="noreferrer">Opus Translator</a>
            <a class="api-docs-pill" href="https://github.com/Helsinki-NLP/OPUS" target="_blank" rel="noreferrer">GitHub</a>
          </nav>
        </section>
        <section class="api-docs-footer-col">
          <nav class="api-docs-footer-links" aria-label="More tools">
            <a href="https://opus.nlpl.eu/bin/opuscqp.pl" target="_blank" rel="noreferrer">Opus Query</a>
            <a href="https://github.com/Helsinki-NLP/OpusTools" target="_blank" rel="noreferrer">Opus Tools (Python Package)</a>
            <a href="https://github.com/Helsinki-NLP/OpusTools-perl" target="_blank" rel="noreferrer">Opus Tools (Perl Package)</a>
            <a href="https://github.com/thammegowda/mtdata" target="_blank" rel="noreferrer">MT-Data</a>
            <a href="https://github.com/robertostling/eflomal" target="_blank" rel="noreferrer">Eflomal Word Aligner</a>
            <a class="api-docs-cta" href="/contact">Contribute to OPUS</a>
            <p>Icons by <a href="https://lucide.dev/license" target="_blank" rel="noreferrer">Lucide</a></p>
          </nav>
        </section>
      </div>
      <aside class="api-docs-footer-meta">
        <a href="https://opus.nlpl.eu/legacy" target="_blank" rel="noreferrer">Opus Legacy</a>
      </aside>
    </div>
  </footer>
  <script>
    (function () {
      var button = document.querySelector(".api-docs-theme");
      if (!button) return;

      button.addEventListener("click", function () {
        var current = document.documentElement.dataset.theme === "light" ? "light" : "dark";
        var next = current === "dark" ? "light" : "dark";
        document.documentElement.dataset.theme = next;
        document.documentElement.style.colorScheme = next;
        try {
          localStorage.setItem("theme", next);
        } catch (e) {}
      });
    })();
  </script>
`;

const SITE_STYLES = `
    :root {
      color-scheme: light dark;
      --font-sans: system-ui, -apple-system, "JetBrains Mono", Roboto, sans-serif;
      --font-mono: ui-monospace, SFMono-Regular, Menlo, Consolas, Monaco, "Liberation Mono", "Courier New", monospace;
      --text-body: 1rem;
      --text-body-line: 1.62;
      --text-copy: 1rem;
      --text-copy-line: 1.65;
      --text-muted-size: 0.98rem;
      --text-label: 0.86rem;
      --text-chip: 0.88rem;
      --text-code: 0.94rem;
      --text-small: 0.92rem;
      --heading-lg: clamp(2rem, 3vw, 2.45rem);
      --heading-md: clamp(1.25rem, 2vw, 1.45rem);
      --radius-md: 14px;
      --radius-pill: 999px;
      --page-max: 1200px;
      --page-gutter: clamp(16px, 8vw, 140px);
      --page-container-width: min(calc(100% - (2 * var(--page-gutter))), var(--page-max));
      --bg: #f8fafc;
      --bg-grad-a: #ffffff;
      --surface: rgba(255, 255, 255, 0.9);
      --surface-strong: #ffffff;
      --surface-raised: rgba(255, 255, 255, 0.96);
      --surface-muted: rgba(248, 250, 252, 0.92);
      --border: rgba(15, 23, 42, 0.12);
      --text-main: #0f172a;
      --text-muted: #475569;
      --accent: #6d28d9;
      --accent-soft: rgba(109, 40, 217, 0.12);
      --link: #2563eb;
      --link-hover: #1d4ed8;
      --success-bg: #ecfdf5;
      --success-fg: #15803d;
      --info-bg: rgba(37, 99, 235, 0.10);
      --info-fg: #1d4ed8;
      --code-bg: #eef2ff;
      --code-fg: #172554;
      --shadow-sm: 0 1px 2px rgba(15, 23, 42, 0.06);
      --ring: 0 0 0 3px rgba(37, 99, 235, 0.25);
    }

    :root[data-theme="dark"] {
      --bg: #020617;
      --bg-grad-a: #111827;
      --surface: rgba(15, 23, 42, 0.78);
      --surface-strong: rgba(15, 23, 42, 0.92);
      --surface-raised: rgba(15, 23, 42, 0.86);
      --surface-muted: rgba(2, 6, 23, 0.72);
      --border: rgba(148, 163, 184, 0.22);
      --text-main: #e5e7eb;
      --text-muted: #9ca3af;
      --accent: #8e75ff;
      --accent-soft: rgba(142, 117, 255, 0.16);
      --link: #60a5fa;
      --link-hover: #93c5fd;
      --success-bg: #052e16;
      --success-fg: #4ade80;
      --info-bg: rgba(96, 165, 250, 0.14);
      --info-fg: #60a5fa;
      --code-bg: #0b1120;
      --code-fg: #e5e7eb;
      --shadow-sm: 0 1px 2px rgba(15, 23, 42, 0.8);
      --ring: 0 0 0 3px rgba(96, 165, 250, 0.28);
    }

    *,
    *::before,
    *::after {
      box-sizing: border-box;
    }

    html {
      font-family: var(--font-sans);
    }

    body {
      min-height: 100vh !important;
      margin: 0 !important;
      display: flex;
      flex-direction: column;
      background: radial-gradient(circle at top left, var(--bg-grad-a), var(--bg)) !important;
      color: var(--text-main) !important;
      font-size: var(--text-body);
      line-height: var(--text-body-line);
    }

    a {
      color: var(--link);
      text-decoration: none;
    }

    a:hover {
      color: var(--link-hover);
      text-decoration: underline;
    }

    code,
    pre,
    kbd,
    samp {
      font-family: var(--font-mono);
    }

    :where(a, button, input, textarea, select, summary, [tabindex]):focus-visible {
      outline: none;
      box-shadow: var(--ring);
      border-radius: 10px;
    }

    [data-theme="dark"] [data-hide-on-theme="dark"],
    [data-theme="light"] [data-hide-on-theme="light"] {
      display: none;
    }

    .api-docs-nav {
      position: sticky;
      top: 0;
      z-index: 2000;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
      padding: 12px clamp(16px, 6vw, 60px);
      background: var(--surface-strong);
      color: var(--text-main);
      border-bottom: 1px solid var(--border);
      box-shadow: var(--shadow-sm);
    }

    .api-docs-brand {
      display: flex;
      align-items: center;
      text-decoration: none;
      flex: 0 0 auto;
    }

    .api-docs-logo {
      display: block;
      width: 80px;
      height: auto;
    }

    .api-docs-actions {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 24px;
      flex-wrap: wrap;
    }

    .api-docs-link,
    .api-docs-theme {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.45rem;
      min-height: 32px;
      padding: 0.52rem 0.9rem;
      border-radius: var(--radius-pill);
      font: inherit;
      font-size: 0.9rem;
      line-height: 1;
      font-weight: 600;
      text-decoration: none;
      white-space: nowrap;
      border: 1px solid transparent;
      color: var(--text-main);
      background: transparent;
      box-shadow: var(--shadow-sm), inset 0 0 0 1px rgba(255, 255, 255, 0.04);
      cursor: pointer;
    }

    .api-docs-theme {
      width: 36px;
      padding: 0;
      border-color: var(--border);
      background: var(--surface);
    }

    .api-docs-secondary {
      border-color: var(--border);
      background: linear-gradient(135deg, var(--surface-strong), var(--surface));
      backdrop-filter: blur(10px) saturate(1.15);
    }

    .api-docs-primary {
      color: #ffffff;
      background: linear-gradient(135deg, color-mix(in srgb, var(--accent) 92%, #000), var(--accent));
      border-color: color-mix(in srgb, var(--accent) 55%, rgba(148, 163, 184, 0.35));
      box-shadow: 0 14px 30px rgba(0, 0, 0, 0.22), 0 0 24px rgba(142, 117, 255, 0.18);
    }

    .api-docs-main {
      width: var(--page-container-width);
      margin: 0 auto;
      padding: clamp(28px, 5vw, 56px) 0 clamp(48px, 7vw, 80px);
      flex: 1 0 auto;
      font-size: var(--text-body);
      line-height: var(--text-body-line);
    }

    .api-docs-main .shell {
      min-height: auto;
      display: block;
      padding: 0;
    }

    .api-docs-main .card {
      width: 100%;
      max-width: none;
      border-radius: 8px;
      color: var(--text-main);
      background: var(--surface-raised);
      border: 1px solid var(--border);
      box-shadow: var(--shadow-sm);
    }

    .api-docs-main > h1:first-child,
    .api-docs-main .shell h1:first-of-type {
      margin-top: 0;
    }

    .api-docs-main .card::before {
      background: radial-gradient(circle at top right, var(--accent-soft), transparent 62%);
    }

    .api-docs-main h1,
    .api-docs-main h2,
    .api-docs-main h3,
    .api-docs-main p,
    .api-docs-main li,
    .api-docs-main section {
      color: var(--text-main);
    }

    .api-docs-main h1 {
      font-size: var(--heading-lg);
      line-height: 1.15;
    }

    .api-docs-main h2 {
      font-size: var(--heading-md);
      line-height: 1.25;
    }

    .api-docs-main p,
    .api-docs-main li {
      font-size: var(--text-copy);
      line-height: var(--text-copy-line);
    }

    .api-docs-main .subtitle,
    .api-docs-main .section-title,
    .api-docs-main .muted,
    .api-docs-main .param-desc,
    .api-docs-main .example-label,
    .api-docs-main .footer-note {
      color: var(--text-muted);
    }

    .api-docs-main .subtitle {
      font-size: 1.05rem;
      line-height: 1.6;
      max-width: 44rem;
    }

    .api-docs-main .muted,
    .api-docs-main .param-desc,
    .api-docs-main .footer-note {
      font-size: var(--text-muted-size);
      line-height: 1.62;
    }

    .api-docs-main .section-title,
    .api-docs-main .example-label {
      font-size: var(--text-label);
      line-height: 1.4;
    }

    .api-docs-main .param-desc b {
      color: var(--text-main);
    }

    .api-docs-main .badge,
    .api-docs-main .param-name,
    .api-docs-main .pill,
    .api-docs-main .tag {
      color: var(--info-fg);
      background: var(--info-bg);
      border-color: var(--border);
      font-size: var(--text-chip);
      line-height: 1.35;
    }

    .api-docs-main .method {
      color: var(--success-fg);
      background: var(--success-bg);
      font-size: 0.82rem;
      line-height: 1.35;
    }

    .api-docs-main .badge-dot {
      background: var(--accent);
      box-shadow: 0 0 0 4px var(--accent-soft);
    }

    .api-docs-main .example-block {
      background: var(--surface-muted);
      border: 1px solid var(--border);
    }

    .api-docs-main .code,
    .api-docs-main .code-block {
      color: var(--code-fg);
      background: var(--code-bg);
      border: 1px solid color-mix(in srgb, var(--border) 65%, transparent);
      font-size: var(--text-code);
      line-height: 1.55;
    }

    .api-docs-main .code-block pre {
      font-size: inherit;
      line-height: inherit;
    }

    .api-docs-main .code-block .method {
      color: var(--success-fg);
      background: transparent;
      border: 0;
    }

    .api-docs-opusapi .api-docs-main .grid {
      grid-template-columns: minmax(0, 1fr);
      gap: clamp(24px, 4vw, 40px);
    }

    .api-docs-opusapi .api-docs-main .param-list {
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 0.85rem;
      margin-bottom: 0;
    }

    .api-docs-opusapi .api-docs-main .param {
      min-height: 100%;
      align-items: flex-start;
      flex-direction: column;
      gap: 0.45rem;
      padding: 0.85rem;
      border: 1px solid var(--border);
      border-radius: 8px;
      background: var(--surface-muted);
    }

    .api-docs-opusapi .api-docs-main .param-desc {
      margin: 0;
    }

    .api-docs-opusapi .api-docs-main .examples {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 0.9rem;
    }

    .api-docs-opusapi .api-docs-main .example-block:first-child {
      grid-column: 1 / -1;
    }

    .api-docs-footer {
      background: var(--bg);
      color: var(--text-main);
      border-top: 1px solid var(--border);
    }

    .api-docs-footer-inner {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: clamp(16px, 6vw, 60px);
      width: var(--page-container-width);
      margin: 0 auto;
      padding: clamp(24px, 5vw, 60px) 0;
      flex-wrap: wrap;
    }

    .api-docs-footer-cols {
      display: flex;
      gap: clamp(24px, 6vw, 100px);
      flex-wrap: wrap;
      min-width: 280px;
      flex: 1 1 560px;
    }

    .api-docs-footer-col {
      display: flex;
      flex-direction: column;
      gap: 10px;
      min-width: 240px;
    }

    .api-docs-footer h3 {
      margin: 0;
      font-size: var(--text-small);
      line-height: 1.35;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: var(--text-muted);
    }

    .api-docs-footer-head {
      width: fit-content;
      text-decoration: none;
    }

    .api-docs-footer-links {
      display: grid;
      gap: 6px;
    }

    .api-docs-footer a,
    .api-docs-footer p {
      color: var(--text-muted);
      font-size: var(--text-small);
      line-height: 1.55;
      width: fit-content;
    }

    .api-docs-footer p {
      margin: 14px 0 0;
      font-size: 0.92rem;
    }

    .api-docs-footer-links span {
      font-family: var(--font-mono);
      font-weight: 700;
    }

    .api-docs-pill {
      margin-top: 10px;
      padding: 0.28rem 0.55rem;
      border-radius: var(--radius-pill);
      border: 1px solid var(--border);
      background: var(--surface-strong);
      box-shadow: var(--shadow-sm);
    }

    .api-docs-cta {
      margin-top: 12px;
      padding: 0.52rem 0.85rem;
      border-radius: var(--radius-pill);
      font-weight: 650;
      color: #fff !important;
      background: var(--accent);
      border: 1px solid color-mix(in srgb, var(--accent) 55%, var(--border));
      box-shadow: var(--shadow-sm);
    }

    .api-docs-footer-meta {
      display: flex;
      align-items: flex-end;
      flex: 0 0 auto;
    }

    .api-docs-footer-meta a {
      text-transform: uppercase;
      letter-spacing: 0.18em;
      font-size: var(--text-label);
      line-height: 1.35;
      padding: 0.5rem 0.65rem;
      border-radius: var(--radius-pill);
      background: var(--surface-strong);
      border: 1px solid var(--border);
      color: var(--text-main);
      box-shadow: var(--shadow-sm);
    }

    @media (max-width: 760px) {
      .api-docs-nav {
        align-items: flex-start;
        flex-direction: column;
      }

      .api-docs-actions {
        justify-content: flex-start;
        gap: 8px;
      }

      .api-docs-link {
        font-size: 0.82rem;
        padding-inline: 0.68rem;
      }
    }
`;

function pageClassFor(page) {
  if (page === "opusapi") return "api-docs-opusapi";
  return "";
}

export function withApiDocsChrome(html, options = {}) {
  const pageClass = pageClassFor(options.page);
  const bodyOpen = pageClass ? `<body class="${pageClass}">` : "<body>";

  return html
    .replace(
      "</head>",
      '  <link rel="icon" href="/images/favicon.ico" />\n</head>',
    )
    .replace("</style>", `${SITE_STYLES}\n  </style>`)
    .replace("<body>", `${bodyOpen}\n${SITE_HEADER}\n  <main class="api-docs-main">`)
    .replace("</body>", `  </main>\n${SITE_FOOTER}\n</body>`);
}
