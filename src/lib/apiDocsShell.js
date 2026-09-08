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
      <button class="api-docs-theme" type="button" aria-label="Toggle theme" aria-pressed="false" title="Light mode">☀️</button>
      <div class="api-docs-api-group">
        <button class="api-docs-api-button api-docs-secondary" type="button" aria-haspopup="menu" aria-expanded="false" aria-controls="api-docs-api-menu">
          <svg class="api-docs-api-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5c0 1.1.9 2 2 2h1"></path>
            <path d="M16 21h1a2 2 0 0 0 2-2v-5c0-1.1.9-2 2-2a2 2 0 0 1-2-2V5a2 2 0 0 0-2-2h-1"></path>
          </svg>
          <span>API</span>
          <svg class="api-docs-chevron" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m6 9 6 6 6-6"></path>
          </svg>
        </button>
        <div class="api-docs-api-menu" id="api-docs-api-menu" role="menu">
          <a href="/opusapi" role="menuitem" data-api-page="opusapi">
            <span class="api-docs-api-title">OPUS API</span>
            <span class="api-docs-api-desc">Corpus and language queries</span>
          </a>
          <a href="/mt-api" role="menuitem" data-api-page="mt-api">
            <span class="api-docs-api-title">MT API</span>
            <span class="api-docs-api-desc">Evaluation scores and models</span>
          </a>
          <a href="/synthetic-api" role="menuitem" data-api-page="synthetic-api">
            <span class="api-docs-api-title">Synthetic API</span>
            <span class="api-docs-api-desc">Synthetic collections and pairs</span>
          </a>
        </div>
      </div>
      <a class="api-docs-link" href="/contact">Contribute</a>
      <a class="api-docs-link" href="/publications">Publications</a>
      <a class="api-docs-link api-docs-secondary" href="/corpora">Corpora</a>
      <a class="api-docs-link api-docs-secondary" href="/synthetic">Synthetic</a>
      <a class="api-docs-link api-docs-primary" href="/mt?source=eng&target=fra&score=spbleu&benchmark=all&model=all">Dashboard</a>
    </nav>
    <button class="api-docs-burger" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="api-docs-mobile-menu">
      <span class="api-docs-burger-line"></span>
      <span class="api-docs-burger-line"></span>
      <span class="api-docs-burger-line"></span>
    </button>
    <nav class="api-docs-mobile-menu" id="api-docs-mobile-menu" aria-label="Mobile navigation">
      <button class="api-docs-theme api-docs-mobile-theme" type="button" aria-label="Toggle theme" aria-pressed="false" title="Light mode">☀️</button>
      <div class="api-docs-mobile-group">
        <button class="api-docs-mobile-api" type="button" aria-expanded="false" aria-controls="api-docs-mobile-api-menu">
          <span class="api-docs-mobile-api-label">
            <svg class="api-docs-api-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5c0 1.1.9 2 2 2h1"></path>
              <path d="M16 21h1a2 2 0 0 0 2-2v-5c0-1.1.9-2 2-2a2 2 0 0 1-2-2V5a2 2 0 0 0-2-2h-1"></path>
            </svg>
            API
          </span>
          <svg class="api-docs-mobile-chevron" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m6 9 6 6 6-6"></path>
          </svg>
        </button>
        <div class="api-docs-mobile-api-menu" id="api-docs-mobile-api-menu">
          <a href="/opusapi" data-api-page="opusapi">OPUS API</a>
          <a href="/mt-api" data-api-page="mt-api">MT API</a>
          <a href="/synthetic-api" data-api-page="synthetic-api">Synthetic API</a>
        </div>
      </div>
      <a class="api-docs-mobile-link" href="/contact">Contribute</a>
      <a class="api-docs-mobile-link" href="/publications">Publications</a>
      <a class="api-docs-mobile-link" href="/corpora">Corpora</a>
      <a class="api-docs-mobile-link" href="/synthetic">Synthetic</a>
      <a class="api-docs-mobile-link api-docs-mobile-primary" href="/mt?source=eng&target=fra&score=spbleu&benchmark=all&model=all">Dashboard</a>
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
        <a href="https://opus.nlpl.eu/legacy/" target="_blank" rel="noreferrer">Opus Legacy</a>
      </aside>
    </div>
  </footer>
  <script>
    (function () {
      var themeButtons = Array.prototype.slice.call(document.querySelectorAll(".api-docs-theme"));
      var burger = document.querySelector(".api-docs-burger");
      var menu = document.querySelector(".api-docs-mobile-menu");
      var desktopApiGroup = document.querySelector(".api-docs-api-group");
      var desktopApiButton = document.querySelector(".api-docs-api-button");
      var desktopApiMenu = document.querySelector(".api-docs-api-menu");
      var apiButton = document.querySelector(".api-docs-mobile-api");
      var apiMenu = document.querySelector(".api-docs-mobile-api-menu");

      function updateThemeButtons(theme) {
        var isDark = theme === "dark";
        themeButtons.forEach(function (button) {
          button.textContent = isDark ? "🌙" : "☀️";
          button.setAttribute("aria-pressed", String(isDark));
          button.setAttribute("title", isDark ? "Light mode" : "Dark mode");
        });
      }

      function toggleTheme() {
        var current = document.documentElement.dataset.theme === "light" ? "light" : "dark";
        var next = current === "dark" ? "light" : "dark";
        document.documentElement.dataset.theme = next;
        document.documentElement.style.colorScheme = next;
        try {
          localStorage.setItem("theme", next);
        } catch (e) {}
        updateThemeButtons(next);
      }

      updateThemeButtons(document.documentElement.dataset.theme === "dark" ? "dark" : "light");

      themeButtons.forEach(function (button) {
        button.addEventListener("click", toggleTheme);
      });

      function closeDesktopApi() {
        if (!desktopApiButton || !desktopApiMenu) return;
        desktopApiButton.setAttribute("aria-expanded", "false");
        desktopApiButton.classList.remove("api-docs-api-button-open");
        desktopApiMenu.classList.remove("api-docs-api-menu-open");
      }

      if (desktopApiButton && desktopApiMenu) {
        desktopApiButton.addEventListener("click", function () {
          var open = desktopApiButton.getAttribute("aria-expanded") === "true";
          desktopApiButton.setAttribute("aria-expanded", String(!open));
          desktopApiButton.classList.toggle("api-docs-api-button-open", !open);
          desktopApiMenu.classList.toggle("api-docs-api-menu-open", !open);
        });

        desktopApiMenu.addEventListener("click", closeDesktopApi);

        document.addEventListener("pointerdown", function (event) {
          if (!desktopApiGroup || desktopApiGroup.contains(event.target)) return;
          closeDesktopApi();
        });

        document.addEventListener("keydown", function (event) {
          if (event.key === "Escape") closeDesktopApi();
        });
      }

      if (burger && menu) {
        burger.addEventListener("click", function () {
          var open = burger.getAttribute("aria-expanded") === "true";
          burger.setAttribute("aria-expanded", String(!open));
          burger.setAttribute("aria-label", open ? "Open menu" : "Close menu");
          burger.classList.toggle("api-docs-burger-open", !open);
          menu.classList.toggle("api-docs-mobile-menu-open", !open);

          if (open && apiButton && apiMenu) {
            apiButton.setAttribute("aria-expanded", "false");
            apiMenu.classList.remove("api-docs-mobile-api-menu-open");
          }
        });
      }

      if (apiButton && apiMenu) {
        apiButton.addEventListener("click", function () {
          var open = apiButton.getAttribute("aria-expanded") === "true";
          apiButton.setAttribute("aria-expanded", String(!open));
          apiMenu.classList.toggle("api-docs-mobile-api-menu-open", !open);
        });

        apiMenu.addEventListener("click", function () {
          apiButton.setAttribute("aria-expanded", "false");
          apiMenu.classList.remove("api-docs-mobile-api-menu-open");
        });
      }
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
    }

    .api-docs-logo {
      display: block;
      width: 80px;
      height: auto;
    }

    .api-docs-actions {
      display: flex;
      align-items: center;
      gap: clamp(12px, 1.6vw, 22px);
    }

    .api-docs-link {
      text-decoration: none;
      color: inherit;
      font-size: 0.9rem;
      transition: color 0.2s ease;
      white-space: nowrap;
    }

    .api-docs-link:hover {
      color: var(--link-hover);
      text-decoration: none;
    }

    .api-docs-api-button,
    .api-docs-secondary,
    .api-docs-primary {
      position: relative;
      overflow: hidden;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.45rem;
      padding: 0.52rem 0.9rem;
      border-radius: var(--radius-pill);
      font-family: var(--font-sans);
      font-size: 0.9rem;
      line-height: 1;
      font-weight: 600;
      letter-spacing: 0.01em;
      text-decoration: none;
      white-space: nowrap;
      user-select: none;
      border: 1px solid transparent;
      color: var(--text-main);
      background: transparent;
      box-shadow: var(--shadow-sm), inset 0 0 0 1px rgba(255, 255, 255, 0.04);
      cursor: pointer;
      transition:
        background-color 160ms ease,
        border-color 160ms ease,
        color 160ms ease,
        box-shadow 160ms ease,
        transform 160ms ease,
        filter 160ms ease;
    }

    .api-docs-api-button::before,
    .api-docs-secondary::before,
    .api-docs-primary::before,
    .api-docs-mobile-primary::before {
      content: "";
      position: absolute;
      inset: -1px;
      background: radial-gradient(circle at top left,
        rgba(255, 255, 255, 0.14),
        transparent 55%);
      opacity: 0;
      pointer-events: none;
      transition: opacity 160ms ease;
    }

    .api-docs-api-button:hover::before,
    .api-docs-secondary:hover::before,
    .api-docs-primary:hover::before,
    .api-docs-mobile-primary:hover::before {
      opacity: 1;
    }

    .api-docs-api-button:active,
    .api-docs-secondary:active,
    .api-docs-primary:active,
    .api-docs-mobile-primary:active {
      transform: translateY(1px);
    }

    .api-docs-api-button:focus-visible,
    .api-docs-secondary:focus-visible,
    .api-docs-primary:focus-visible,
    .api-docs-mobile-primary:focus-visible {
      outline: none;
      box-shadow: var(--ring), var(--shadow-sm), inset 0 0 0 1px rgba(255, 255, 255, 0.04);
    }

    .api-docs-theme {
      display: inline-grid;
      place-items: center;
      width: 36px;
      height: 36px;
      padding: 0;
      border-radius: var(--radius-pill);
      border: 1px solid var(--border);
      border-color: var(--border);
      background: var(--surface-strong);
      color: var(--text-main);
      font: inherit;
      cursor: pointer;
      box-shadow: var(--shadow-sm);
      transition: background-color 0.15s ease, border-color 0.15s ease;
    }

    .api-docs-theme:hover {
      text-decoration: none;
      border-color: color-mix(in srgb, var(--link) 28%, var(--border));
      background: rgba(37, 99, 235, 0.05);
    }

    .api-docs-theme:focus-visible {
      outline: none;
      box-shadow: var(--ring), var(--shadow-sm);
    }

    .api-docs-secondary {
      border-color: var(--border);
      background: linear-gradient(135deg,
        color-mix(in srgb, var(--surface-strong) 88%, transparent),
        color-mix(in srgb, var(--surface) 92%, transparent));
      backdrop-filter: blur(10px) saturate(1.15);
    }

    .api-docs-secondary:hover {
      border-color: color-mix(in srgb, var(--accent) 35%, var(--border));
      background: linear-gradient(135deg,
        color-mix(in srgb, var(--accent-soft) 55%, var(--surface-strong)),
        color-mix(in srgb, var(--surface) 92%, transparent));
    }

    .api-docs-api-group {
      position: relative;
      display: inline-flex;
    }

    .api-docs-api-button {
      cursor: pointer;
    }

    .api-docs-api-icon {
      width: 16px;
      height: 16px;
      flex: 0 0 auto;
    }

    .api-docs-chevron {
      width: 15px;
      height: 15px;
      flex: 0 0 auto;
    }

    .api-docs-mobile-chevron {
      width: 16px;
      height: 16px;
      flex: 0 0 auto;
    }

    .api-docs-chevron,
    .api-docs-mobile-chevron {
      transition: transform 160ms ease;
    }

    .api-docs-api-button-open .api-docs-chevron,
    .api-docs-mobile-api[aria-expanded="true"] .api-docs-mobile-chevron {
      transform: rotate(180deg);
    }

    .api-docs-api-menu {
      position: absolute;
      top: calc(100% + 10px);
      right: 0;
      width: min(280px, calc(100vw - 32px));
      display: grid;
      gap: 4px;
      padding: 8px;
      border: 1px solid var(--border);
      border-radius: 12px;
      background: color-mix(in srgb, var(--surface-strong) 94%, transparent);
      box-shadow: 0 18px 38px rgba(0, 0, 0, 0.18), var(--shadow-sm);
      backdrop-filter: blur(14px) saturate(1.15);
      opacity: 0;
      pointer-events: none;
      transform: translateY(-4px);
      transition: opacity 160ms ease, transform 160ms ease;
    }

    .api-docs-api-menu-open {
      opacity: 1;
      pointer-events: auto;
      transform: translateY(0);
    }

    .api-docs-api-menu a {
      display: grid;
      gap: 3px;
      padding: 10px 11px;
      border-radius: 8px;
      color: var(--text-main);
      text-decoration: none;
      transition: background 160ms ease, color 160ms ease;
    }

    .api-docs-api-menu a:hover {
      color: var(--text-main);
      text-decoration: none;
      background: color-mix(in srgb, var(--accent-soft) 58%, transparent);
    }

    .api-docs-api-title {
      font-size: 0.9rem;
      line-height: 1.25;
      font-weight: 750;
    }

    .api-docs-api-desc {
      font-size: 0.76rem;
      line-height: 1.35;
      color: var(--text-muted);
    }

    .api-docs-opusapi .api-docs-api-button,
    .api-docs-mtapi .api-docs-api-button,
    .api-docs-syntheticapi .api-docs-api-button {
      border-color: color-mix(in srgb, var(--accent) 42%, var(--border));
      background: linear-gradient(135deg,
        color-mix(in srgb, var(--accent-soft) 65%, var(--surface-strong)),
        color-mix(in srgb, var(--surface) 90%, transparent));
      color: var(--text-main);
    }

    .api-docs-opusapi [data-api-page="opusapi"],
    .api-docs-mtapi [data-api-page="mt-api"],
    .api-docs-syntheticapi [data-api-page="synthetic-api"] {
      color: var(--link-hover);
      background: color-mix(in srgb, var(--accent-soft) 58%, transparent);
    }

    .api-docs-primary {
      color: #ffffff;
      background: linear-gradient(135deg, color-mix(in srgb, var(--accent) 92%, #000), var(--accent));
      border-color: color-mix(in srgb, var(--accent) 55%, rgba(148, 163, 184, 0.35));
      box-shadow:
        0 14px 30px rgba(0, 0, 0, 0.22),
        0 0 0 1px rgba(15, 23, 42, 0.65),
        0 0 24px rgba(142, 117, 255, 0.18);
    }

    .api-docs-primary:hover {
      color: #ffffff;
      filter: brightness(1.05);
      box-shadow:
        0 16px 34px rgba(0, 0, 0, 0.26),
        0 0 0 1px rgba(15, 23, 42, 0.75),
        0 0 30px rgba(142, 117, 255, 0.24);
    }

    @media (prefers-reduced-motion: reduce) {
      .api-docs-api-button,
      .api-docs-api-button::before,
      .api-docs-secondary,
      .api-docs-secondary::before,
      .api-docs-primary,
      .api-docs-primary::before,
      .api-docs-mobile-primary,
      .api-docs-mobile-primary::before {
        transition: none;
      }
    }

    .api-docs-burger {
      display: none;
      margin-left: 12px;
      width: 42px;
      height: 42px;
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      background: var(--surface);
      color: var(--text-main);
      box-shadow: var(--shadow-sm);
      cursor: pointer;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      gap: 5px;
      transition: border-color 0.16s ease, background 0.16s ease, transform 0.16s ease;
    }

    .api-docs-burger:hover {
      border-color: color-mix(in oklab, var(--accent) 32%, var(--border));
      background: color-mix(in oklab, var(--surface-strong) 88%, var(--accent-soft));
    }

    .api-docs-burger:active {
      transform: translateY(1px);
    }

    .api-docs-burger-line {
      display: block;
      width: 18px;
      height: 2px;
      border-radius: var(--radius-pill);
      background: currentColor;
      transform-origin: center;
      transition: transform 0.18s ease, opacity 0.18s ease;
    }

    .api-docs-burger-open .api-docs-burger-line:nth-child(1) {
      transform: translateY(7px) rotate(45deg);
    }

    .api-docs-burger-open .api-docs-burger-line:nth-child(2) {
      opacity: 0;
    }

    .api-docs-burger-open .api-docs-burger-line:nth-child(3) {
      transform: translateY(-7px) rotate(-45deg);
    }

    .api-docs-mobile-menu {
      display: none;
    }

    .api-docs-mobile-link,
    .api-docs-mobile-api {
      min-height: 42px;
      padding: 12px 0;
      border: 0;
      border-bottom: 1px solid var(--border);
      border-radius: 0;
      background: transparent;
      color: var(--text-main);
      font: inherit;
      font-size: 0.95rem;
      line-height: 1.35;
      text-decoration: none;
    }

    .api-docs-mobile-link {
      display: flex;
      align-items: center;
    }

    .api-docs-mobile-link:hover,
    .api-docs-mobile-api:hover {
      color: var(--link-hover);
      text-decoration: none;
    }

    .api-docs-mobile-primary {
      position: relative;
      overflow: hidden;
      justify-content: center;
      margin-top: 10px;
      padding: 0.52rem 0.9rem;
      border-radius: var(--radius-pill);
      border: 1px solid color-mix(in srgb, var(--accent) 55%, rgba(148, 163, 184, 0.35));
      color: #ffffff;
      background: linear-gradient(135deg, color-mix(in srgb, var(--accent) 92%, #000), var(--accent));
      box-shadow:
        0 14px 30px rgba(0, 0, 0, 0.22),
        0 0 0 1px rgba(15, 23, 42, 0.65),
        0 0 24px rgba(142, 117, 255, 0.18);
      font-weight: 600;
      line-height: 1;
      transition:
        background-color 160ms ease,
        border-color 160ms ease,
        color 160ms ease,
        box-shadow 160ms ease,
        transform 160ms ease,
        filter 160ms ease;
    }

    .api-docs-mobile-primary:hover {
      color: #ffffff;
      filter: brightness(1.05);
      box-shadow:
        0 16px 34px rgba(0, 0, 0, 0.26),
        0 0 0 1px rgba(15, 23, 42, 0.75),
        0 0 30px rgba(142, 117, 255, 0.24);
    }

    .api-docs-mobile-group {
      display: grid;
      border-bottom: 1px solid var(--border);
    }

    .api-docs-mobile-api {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      cursor: pointer;
    }

    .api-docs-mobile-api-label {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-weight: 700;
    }

    .api-docs-mobile-api-menu {
      display: none;
    }

    .api-docs-mobile-api-menu-open {
      display: grid;
      gap: 0;
      padding: 0 0 8px 10px;
      border-left: 1px solid var(--border);
    }

    .api-docs-mobile-api-menu a {
      display: flex;
      align-items: center;
      min-height: 38px;
      padding: 8px 10px;
      color: var(--text-main);
      text-decoration: none;
    }

    .api-docs-mobile-api-menu a:hover {
      color: var(--link-hover);
      text-decoration: none;
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

    :is(.api-docs-opusapi, .api-docs-mtapi, .api-docs-syntheticapi) .api-docs-main .grid {
      grid-template-columns: minmax(0, 1fr);
      gap: clamp(24px, 4vw, 40px);
    }

    :is(.api-docs-opusapi, .api-docs-mtapi, .api-docs-syntheticapi) .api-docs-main .docs {
      width: 100%;
      max-width: none;
      color: var(--text-main);
      background: transparent;
      border: 0;
      box-shadow: none;
    }

    :is(.api-docs-opusapi, .api-docs-mtapi, .api-docs-syntheticapi) .api-docs-main .badge {
      display: inline-flex;
      justify-self: start;
      width: max-content;
      max-width: 100%;
      background: color-mix(in srgb, var(--info-bg) 72%, transparent);
    }

    :is(.api-docs-opusapi, .api-docs-mtapi, .api-docs-syntheticapi) .api-docs-main .subtitle {
      padding-bottom: 0.75rem;
      border-bottom: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
    }

    :is(.api-docs-opusapi, .api-docs-mtapi, .api-docs-syntheticapi) .api-docs-main .param-list {
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      column-gap: clamp(28px, 4vw, 48px);
      row-gap: 0;
      margin-bottom: 0;
    }

    :is(.api-docs-opusapi, .api-docs-mtapi, .api-docs-syntheticapi) .api-docs-main .param {
      min-height: 100%;
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      align-content: start;
      gap: 0.24rem;
      padding: 0.78rem 0;
      border: 0;
      border-top: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
      border-radius: 0;
      background: transparent;
    }

    :is(.api-docs-opusapi, .api-docs-mtapi, .api-docs-syntheticapi) .api-docs-main .param:last-child {
      border-bottom: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
    }

    :is(.api-docs-opusapi, .api-docs-mtapi, .api-docs-syntheticapi) .api-docs-main .param-desc {
      margin: 0;
    }

    :is(.api-docs-opusapi, .api-docs-mtapi, .api-docs-syntheticapi) .api-docs-main .param-name {
      display: inline-flex;
      justify-self: start;
      width: max-content;
      padding: 0;
      color: var(--accent);
      background: transparent;
      border: 0;
      font-weight: 650;
    }

    :is(.api-docs-opusapi, .api-docs-mtapi, .api-docs-syntheticapi) .api-docs-main .examples {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: 0;
    }

    :is(.api-docs-opusapi, .api-docs-mtapi, .api-docs-syntheticapi) .api-docs-main .example-block:first-child {
      grid-column: auto;
    }

    :is(.api-docs-opusapi, .api-docs-mtapi, .api-docs-syntheticapi) .api-docs-main .example-block {
      padding: 1rem 0;
      border: 0;
      border-top: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
      border-radius: 0;
      background: transparent;
    }

    :is(.api-docs-opusapi, .api-docs-mtapi, .api-docs-syntheticapi) .api-docs-main .example-block:last-child {
      border-bottom: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
    }

    :is(.api-docs-opusapi, .api-docs-mtapi, .api-docs-syntheticapi) .api-docs-main .code {
      display: block;
      width: 100%;
      padding: 0.52rem 0.62rem;
      border-radius: 8px;
      overflow-wrap: anywhere;
    }

    :is(.api-docs-opusapi, .api-docs-mtapi, .api-docs-syntheticapi) .api-docs-main .code-action {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 2.35rem;
      gap: 0.55rem;
      align-items: start;
    }

    :is(.api-docs-opusapi, .api-docs-mtapi, .api-docs-syntheticapi) .api-docs-main .example-link {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 2.35rem;
      height: 2.35rem;
      border-radius: 8px;
      border: 1px solid color-mix(in srgb, var(--accent) 48%, var(--border));
      background: color-mix(in srgb, var(--accent) 14%, transparent);
      color: var(--accent);
      text-decoration: none;
      font-size: 1rem;
      font-weight: 700;
      transition: background 160ms ease, border-color 160ms ease, color 160ms ease;
    }

    :is(.api-docs-opusapi, .api-docs-mtapi, .api-docs-syntheticapi) .api-docs-main .example-link:hover,
    :is(.api-docs-opusapi, .api-docs-mtapi, .api-docs-syntheticapi) .api-docs-main .example-link:focus-visible {
      background: var(--accent);
      border-color: var(--accent);
      color: #ffffff;
      outline: none;
    }

    :is(.api-docs-opusapi, .api-docs-mtapi, .api-docs-syntheticapi) .api-docs-main .pill {
      display: inline-flex;
      width: max-content;
      max-width: 100%;
    }

    @media (max-width: 880px) {
      :is(.api-docs-opusapi, .api-docs-mtapi, .api-docs-syntheticapi) .api-docs-main .grid,
      :is(.api-docs-opusapi, .api-docs-mtapi, .api-docs-syntheticapi) .api-docs-main .param-list,
      :is(.api-docs-opusapi, .api-docs-mtapi, .api-docs-syntheticapi) .api-docs-main .param {
        grid-template-columns: minmax(0, 1fr);
      }
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

    @media (max-width: 1024px) {
      .api-docs-nav {
        align-items: center;
      }

      .api-docs-actions {
        display: none;
      }

      .api-docs-burger {
        display: inline-flex;
      }

      .api-docs-mobile-menu-open {
        display: flex;
        flex-direction: column;
        position: fixed;
        top: 65px;
        left: 0;
        width: 100%;
        max-height: calc(100dvh - 65px);
        overflow-y: auto;
        padding: 18px clamp(16px, 8vw, 60px) 24px;
        background: var(--bg);
        border-bottom: 1px solid var(--border);
        box-shadow: 0 18px 42px rgba(0, 0, 0, 0.28), var(--shadow-sm);
        z-index: 1500;
      }
    }

    @media (max-width: 600px) {
      .api-docs-nav {
        padding-inline: 12px;
      }

      .api-docs-mobile-menu-open {
        padding-inline: 16px;
      }
    }
`;

function pageClassFor(page) {
  if (page === "opusapi") return "api-docs-opusapi";
  if (page === "mt-api") return "api-docs-mtapi";
  if (page === "synthetic-api") return "api-docs-syntheticapi";
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
