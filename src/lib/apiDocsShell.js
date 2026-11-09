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
      <div class="api-docs-nav-group api-docs-nav-group-explore">
        <button class="api-docs-group-button api-docs-secondary api-docs-explore-button" type="button" aria-haspopup="menu" aria-expanded="false" aria-controls="api-docs-explore-menu">
          <svg class="api-docs-nav-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
          </svg>
          <span>Explore</span>
          <svg class="api-docs-chevron" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m6 9 6 6 6-6"></path>
          </svg>
        </button>
        <div class="api-docs-nav-menu" id="api-docs-explore-menu" role="menu">
          <a href="/corpora" role="menuitem">
            <span class="api-docs-nav-title">Corpora</span>
            <span class="api-docs-nav-desc">Browse released corpora</span>
          </a>
          <a href="/synthetic" role="menuitem">
            <span class="api-docs-nav-title">Synthetic</span>
            <span class="api-docs-nav-desc">Synthetic corpus collections</span>
          </a>
          <a href="/mt?source=eng&target=fra&score=spbleu&benchmark=all&model=all" role="menuitem">
            <span class="api-docs-nav-title">Dashboard</span>
            <span class="api-docs-nav-desc">MT model scores and comparisons</span>
          </a>
        </div>
      </div>
      <div class="api-docs-nav-group api-docs-nav-group-api">
        <button class="api-docs-group-button api-docs-secondary" type="button" aria-haspopup="menu" aria-expanded="false" aria-controls="api-docs-api-menu">
          <svg class="api-docs-nav-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5c0 1.1.9 2 2 2h1"></path>
            <path d="M16 21h1a2 2 0 0 0 2-2v-5c0-1.1.9-2 2-2a2 2 0 0 1-2-2V5a2 2 0 0 0-2-2h-1"></path>
          </svg>
          <span>API</span>
          <svg class="api-docs-chevron" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m6 9 6 6 6-6"></path>
          </svg>
        </button>
        <div class="api-docs-nav-menu" id="api-docs-api-menu" role="menu">
          <a href="/opusapi" role="menuitem" data-api-page="opusapi">
            <span class="api-docs-nav-title">OPUS API</span>
            <span class="api-docs-nav-desc">Corpus and language queries</span>
          </a>
          <a href="/mt-api" role="menuitem" data-api-page="mt-api">
            <span class="api-docs-nav-title">MT API</span>
            <span class="api-docs-nav-desc">Evaluation scores and models</span>
          </a>
          <a href="/synthetic-api" role="menuitem" data-api-page="synthetic-api">
            <span class="api-docs-nav-title">Synthetic API</span>
            <span class="api-docs-nav-desc">Synthetic collections and pairs</span>
          </a>
        </div>
      </div>
      <div class="api-docs-nav-group api-docs-nav-group-resources">
        <button class="api-docs-group-button api-docs-secondary" type="button" aria-haspopup="menu" aria-expanded="false" aria-controls="api-docs-resources-menu">
          <svg class="api-docs-nav-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 7v14"></path>
            <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"></path>
          </svg>
          <span>Resources</span>
          <svg class="api-docs-chevron" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m6 9 6 6 6-6"></path>
          </svg>
        </button>
        <div class="api-docs-nav-menu" id="api-docs-resources-menu" role="menu">
          <a href="/download-formats" role="menuitem">
            <span class="api-docs-nav-title">Data formats</span>
            <span class="api-docs-nav-desc">Download format reference</span>
          </a>
          <a href="/publications" role="menuitem">
            <span class="api-docs-nav-title">Publications</span>
            <span class="api-docs-nav-desc">Papers and citations</span>
          </a>
        </div>
      </div>
      <a class="api-docs-link api-docs-contribute-link" href="/contact">Contribute</a>
    </nav>
    <button class="api-docs-burger" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="api-docs-mobile-menu">
      <span class="api-docs-burger-line"></span>
      <span class="api-docs-burger-line"></span>
      <span class="api-docs-burger-line"></span>
    </button>
    <nav class="api-docs-mobile-menu" id="api-docs-mobile-menu" aria-label="Mobile navigation">
      <button class="api-docs-theme api-docs-mobile-theme" type="button" aria-label="Toggle theme" aria-pressed="false" title="Light mode">☀️</button>
      <div class="api-docs-mobile-group api-docs-mobile-group-explore">
        <button class="api-docs-mobile-group-button" type="button" aria-expanded="false" aria-controls="api-docs-mobile-explore-menu">
          <span class="api-docs-mobile-group-label">
            <svg class="api-docs-nav-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
            </svg>
            Explore
          </span>
          <svg class="api-docs-mobile-chevron" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m6 9 6 6 6-6"></path>
          </svg>
        </button>
        <div class="api-docs-mobile-submenu" id="api-docs-mobile-explore-menu">
          <a href="/corpora">Corpora</a>
          <a href="/synthetic">Synthetic</a>
          <a href="/mt?source=eng&target=fra&score=spbleu&benchmark=all&model=all">Dashboard</a>
        </div>
      </div>
      <div class="api-docs-mobile-group api-docs-mobile-group-api">
        <button class="api-docs-mobile-group-button" type="button" aria-expanded="false" aria-controls="api-docs-mobile-api-menu">
          <span class="api-docs-mobile-group-label">
            <svg class="api-docs-nav-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5c0 1.1.9 2 2 2h1"></path>
              <path d="M16 21h1a2 2 0 0 0 2-2v-5c0-1.1.9-2 2-2a2 2 0 0 1-2-2V5a2 2 0 0 0-2-2h-1"></path>
            </svg>
            API
          </span>
          <svg class="api-docs-mobile-chevron" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m6 9 6 6 6-6"></path>
          </svg>
        </button>
        <div class="api-docs-mobile-submenu" id="api-docs-mobile-api-menu">
          <a href="/opusapi" data-api-page="opusapi">OPUS API</a>
          <a href="/mt-api" data-api-page="mt-api">MT API</a>
          <a href="/synthetic-api" data-api-page="synthetic-api">Synthetic API</a>
        </div>
      </div>
      <div class="api-docs-mobile-group api-docs-mobile-group-resources">
        <button class="api-docs-mobile-group-button" type="button" aria-expanded="false" aria-controls="api-docs-mobile-resources-menu">
          <span class="api-docs-mobile-group-label">
            <svg class="api-docs-nav-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 7v14"></path>
              <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"></path>
            </svg>
            Resources
          </span>
          <svg class="api-docs-mobile-chevron" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m6 9 6 6 6-6"></path>
          </svg>
        </button>
        <div class="api-docs-mobile-submenu" id="api-docs-mobile-resources-menu">
          <a href="/download-formats">Data formats</a>
          <a href="/publications">Publications</a>
        </div>
      </div>
      <a class="api-docs-mobile-link api-docs-mobile-contribute" href="/contact">Contribute</a>
    </nav>
  </header>
`;

const SITE_FOOTER = `
  <footer class="api-docs-footer">
    <div class="api-docs-footer-inner">
      <div class="api-docs-footer-cols">
        <section class="api-docs-footer-col">
          <h3>Tools</h3>
          <nav class="api-docs-footer-links" aria-label="Tools">
            <a href="https://pypi.org/project/opustools/" target="_blank" rel="noreferrer">Opus Tools</a>
            <a href="https://pypi.org/project/opusfilter/" target="_blank" rel="noreferrer">Opus Filter</a>
            <a href="https://github.com/Helsinki-NLP/OpusDistillery" target="_blank" rel="noreferrer">OPUS Distillery</a>
          </nav>
        </section>
        <section class="api-docs-footer-col">
          <h3>Search</h3>
          <nav class="api-docs-footer-links" aria-label="Search tools">
            <a href="https://opus.nlpl.eu/bin/opuscqp.pl" target="_blank" rel="noreferrer">Opus Query</a>
            <a href="https://opus.nlpl.eu/legacy/lex.php" target="_blank" rel="noreferrer">Opus Wordalign</a>
            <a href="https://opus.nlpl.eu/explore/" target="_blank" rel="noreferrer">Opus Explorer</a>
          </nav>
        </section>
        <section class="api-docs-footer-col">
          <h3>Translation</h3>
          <nav class="api-docs-footer-links" aria-label="Translation tools">
            <a href="https://github.com/Helsinki-NLP/OpusTranslate" target="_blank" rel="noreferrer">OpusTranslate MobileApp</a>
            <a href="https://github.com/Helsinki-NLP/OPUS-MT-app" target="_blank" rel="noreferrer">OpusTranslate DesktopApp</a>
            <a href="https://helsinki-nlp.github.io/OPUS-CAT/" target="_blank" rel="noreferrer">OPUS-CAT</a>
          </nav>
        </section>
      </div>
      <aside class="api-docs-footer-meta">
        <a class="api-docs-footer-cta" href="/contact">Contribute to OPUS</a>
        <a class="api-docs-footer-legacy" href="https://opus.nlpl.eu/legacy/" target="_blank" rel="noreferrer">Opus Legacy</a>
        <a class="api-docs-footer-github" href="https://github.com/Helsinki-NLP/OPUS" target="_blank" rel="noreferrer">GitHub</a>
      </aside>
    </div>
  </footer>
  <script>
    (function () {
      var themeButtons = Array.prototype.slice.call(document.querySelectorAll(".api-docs-theme"));
      var burger = document.querySelector(".api-docs-burger");
      var menu = document.querySelector(".api-docs-mobile-menu");
      var desktopGroups = Array.prototype.slice.call(document.querySelectorAll(".api-docs-nav-group"));
      var mobileGroupButtons = Array.prototype.slice.call(document.querySelectorAll(".api-docs-mobile-group-button"));

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

      function hrefMatchesCurrent(anchor) {
        try {
          var url = new URL(anchor.getAttribute("href"), window.location.origin);
          var path = url.pathname;
          return window.location.pathname === path || (path !== "/" && window.location.pathname.indexOf(path + "/") === 0);
        } catch (e) {
          return false;
        }
      }

      function closeDesktopGroups(exceptButton) {
        desktopGroups.forEach(function (group) {
          var button = group.querySelector(".api-docs-group-button");
          var submenu = group.querySelector(".api-docs-nav-menu");
          if (!button || !submenu || button === exceptButton) return;
          button.setAttribute("aria-expanded", "false");
          button.classList.remove("api-docs-group-button-open");
          submenu.classList.remove("api-docs-nav-menu-open");
        });
      }

      desktopGroups.forEach(function (group) {
        var button = group.querySelector(".api-docs-group-button");
        var submenu = group.querySelector(".api-docs-nav-menu");
        if (!button || !submenu) return;

        button.addEventListener("click", function () {
          var open = button.getAttribute("aria-expanded") === "true";
          closeDesktopGroups(button);
          button.setAttribute("aria-expanded", String(!open));
          button.classList.toggle("api-docs-group-button-open", !open);
          submenu.classList.toggle("api-docs-nav-menu-open", !open);
        });

        submenu.addEventListener("click", function () {
          closeDesktopGroups();
        });
      });

      document.addEventListener("pointerdown", function (event) {
        var insideGroup = desktopGroups.some(function (group) {
          return group.contains(event.target);
        });
        if (!insideGroup) closeDesktopGroups();
      });

      document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") closeDesktopGroups();
      });

      document.querySelectorAll(".api-docs-nav-menu a, .api-docs-mobile-submenu a, .api-docs-link, .api-docs-mobile-link").forEach(function (anchor) {
        if (!hrefMatchesCurrent(anchor)) return;
        anchor.classList.add("api-docs-link-active");
        var desktopGroup = anchor.closest(".api-docs-nav-group");
        var desktopButton = desktopGroup && desktopGroup.querySelector(".api-docs-group-button");
        if (desktopButton) desktopButton.classList.add("api-docs-group-active");
        var mobileGroup = anchor.closest(".api-docs-mobile-group");
        var mobileButton = mobileGroup && mobileGroup.querySelector(".api-docs-mobile-group-button");
        if (mobileButton) mobileButton.classList.add("api-docs-link-active");
      });

      if (burger && menu) {
        burger.addEventListener("click", function () {
          var open = burger.getAttribute("aria-expanded") === "true";
          burger.setAttribute("aria-expanded", String(!open));
          burger.setAttribute("aria-label", open ? "Open menu" : "Close menu");
          burger.classList.toggle("api-docs-burger-open", !open);
          menu.classList.toggle("api-docs-mobile-menu-open", !open);

          if (open) {
            mobileGroupButtons.forEach(function (button) {
              var submenu = document.getElementById(button.getAttribute("aria-controls"));
              button.setAttribute("aria-expanded", "false");
              if (submenu) submenu.classList.remove("api-docs-mobile-submenu-open");
            });
          }
        });
      }

      mobileGroupButtons.forEach(function (button) {
        var submenu = document.getElementById(button.getAttribute("aria-controls"));
        if (!submenu) return;

        button.addEventListener("click", function () {
          var open = button.getAttribute("aria-expanded") === "true";
          mobileGroupButtons.forEach(function (otherButton) {
            var otherSubmenu = document.getElementById(otherButton.getAttribute("aria-controls"));
            if (otherButton !== button) otherButton.setAttribute("aria-expanded", "false");
            if (otherButton !== button && otherSubmenu) otherSubmenu.classList.remove("api-docs-mobile-submenu-open");
          });
          button.setAttribute("aria-expanded", String(!open));
          submenu.classList.toggle("api-docs-mobile-submenu-open", !open);
        });

        submenu.addEventListener("click", function () {
          button.setAttribute("aria-expanded", "false");
          submenu.classList.remove("api-docs-mobile-submenu-open");
        });
      });
    })();
  </script>
`;

const SITE_STYLES = `
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
        sans-serif;
    }
    .docs {
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
    }
    h1 {
      margin: 0.75rem 0 0.25rem;
      letter-spacing: 0;
    }
    .subtitle {
      margin: 0.25rem 0 0;
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
    }
    .section-title {
      letter-spacing: 0.16em;
      text-transform: uppercase;
      margin: 0 0 0.75rem;
    }
    .param-list {
      display: grid;
      margin: 0;
    }
    .param-name {
      white-space: nowrap;
    }
    .param-desc b {
      font-weight: 500;
    }
    .example-label {
      text-transform: uppercase;
      letter-spacing: 0.12em;
      margin-bottom: 0.45rem;
    }
    .method {
      display: inline-flex;
      padding: 0.15rem 0.4rem;
      border-radius: 999px;
      font-weight: 650;
    }
    .pill-row {
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;
      margin-bottom: 0.5rem;
    }
    .pill {
      padding: 0.12rem 0.55rem;
      border-radius: 999px;
      border: 1px solid rgba(148,163,184,0.3);
    }
    .code {
      word-break: normal;
    }
    .muted {
      margin-top: 0.5rem;
    }
    .footer-note {
      margin: 0.75rem 0 0;
      padding-top: 0.9rem;
      border-top: 1px solid color-mix(in oklab, var(--border) 70%, transparent);
    }

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

    .api-docs-contribute-link {
      order: 1;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0.52rem 0.85rem;
      border: 1px solid color-mix(in srgb, var(--link) 28%, var(--border));
      border-radius: var(--radius-pill);
      background: color-mix(in srgb, var(--surface-strong) 86%, var(--link));
      color: var(--text-main);
      box-shadow: var(--shadow-sm);
      font-weight: 650;
      line-height: 1;
      transition:
        border-color 160ms ease,
        background 160ms ease,
        color 160ms ease,
        transform 160ms ease;
    }

    .api-docs-contribute-link:hover,
    .api-docs-contribute-link.api-docs-link-active {
      border-color: color-mix(in srgb, var(--link) 42%, var(--border));
      background: color-mix(in srgb, var(--surface-strong) 76%, var(--link));
      color: var(--link-hover);
      text-decoration: none;
    }

    .api-docs-contribute-link:active {
      transform: translateY(1px);
    }

    .api-docs-group-button,
    .api-docs-secondary {
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

    .api-docs-group-button::before,
    .api-docs-secondary::before {
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

    .api-docs-group-button:hover::before,
    .api-docs-secondary:hover::before {
      opacity: 1;
    }

    .api-docs-group-button:active,
    .api-docs-secondary:active {
      transform: translateY(1px);
    }

    .api-docs-group-button:focus-visible,
    .api-docs-secondary:focus-visible {
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

    .api-docs-nav-group {
      position: relative;
      display: inline-flex;
    }

    .api-docs-nav-group-api {
      order: 2;
    }

    .api-docs-nav-group-resources {
      order: 3;
    }

    .api-docs-nav-group-explore {
      order: 4;
    }

    .api-docs-group-button {
      cursor: pointer;
    }

    .api-docs-nav-icon {
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

    .api-docs-group-button-open .api-docs-chevron,
    .api-docs-mobile-group-button[aria-expanded="true"] .api-docs-mobile-chevron {
      transform: rotate(180deg);
    }

    .api-docs-nav-menu {
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

    .api-docs-nav-menu-open {
      opacity: 1;
      pointer-events: auto;
      transform: translateY(0);
    }

    .api-docs-nav-menu a {
      display: grid;
      gap: 3px;
      padding: 10px 11px;
      border-radius: 8px;
      color: var(--text-main);
      text-decoration: none;
      transition: background 160ms ease, color 160ms ease;
    }

    .api-docs-nav-menu a:hover,
    .api-docs-nav-menu a.api-docs-link-active {
      color: var(--text-main);
      text-decoration: none;
      background: color-mix(in srgb, var(--accent-soft) 58%, transparent);
    }

    .api-docs-nav-title {
      font-size: 0.9rem;
      line-height: 1.25;
      font-weight: 750;
    }

    .api-docs-nav-desc {
      font-size: 0.76rem;
      line-height: 1.35;
      color: var(--text-muted);
    }

    .api-docs-group-active {
      border-color: color-mix(in srgb, var(--accent) 42%, var(--border));
      background: linear-gradient(135deg,
        color-mix(in srgb, var(--accent-soft) 65%, var(--surface-strong)),
        color-mix(in srgb, var(--surface) 90%, transparent));
      color: var(--text-main);
    }

    .api-docs-explore-button {
      padding-inline: 1rem;
      color: #ffffff;
      border-color: color-mix(in srgb, var(--accent) 55%, rgba(148, 163, 184, 0.35));
      background: linear-gradient(135deg,
        color-mix(in srgb, var(--accent) 92%, #000),
        var(--accent));
      box-shadow:
        0 14px 30px rgba(0, 0, 0, 0.22),
        0 0 0 1px rgba(15, 23, 42, 0.65),
        0 0 24px rgba(142, 117, 255, 0.18);
    }

    .api-docs-explore-button:hover,
    .api-docs-explore-button.api-docs-group-active {
      color: #ffffff;
      filter: brightness(1.05);
      background: linear-gradient(135deg,
        color-mix(in srgb, var(--accent) 92%, #000),
        var(--accent));
      box-shadow:
        0 16px 34px rgba(0, 0, 0, 0.26),
        0 0 0 1px rgba(15, 23, 42, 0.75),
        0 0 30px rgba(142, 117, 255, 0.24);
    }

    .api-docs-link-active {
      color: var(--link-hover);
      background: color-mix(in srgb, var(--accent-soft) 58%, transparent);
    }

    @media (prefers-reduced-motion: reduce) {
      .api-docs-group-button,
      .api-docs-group-button::before,
      .api-docs-secondary,
      .api-docs-secondary::before {
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
    .api-docs-mobile-group-button {
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
    .api-docs-mobile-group-button:hover {
      color: var(--link-hover);
      text-decoration: none;
    }

    .api-docs-mobile-theme {
      order: 0;
    }

    .api-docs-mobile-contribute {
      order: 1;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 40px;
      width: fit-content;
      margin: 4px 0 10px;
      padding: 0.58rem 0.9rem;
      border: 1px solid color-mix(in srgb, var(--link) 30%, var(--border));
      border-radius: var(--radius-pill);
      background: color-mix(in srgb, var(--surface-strong) 84%, var(--link));
      color: var(--text-main);
      box-shadow: var(--shadow-sm);
      font-size: 0.95rem;
      line-height: 1;
      font-weight: 700;
      text-decoration: none;
    }

    .api-docs-mobile-contribute:hover,
    .api-docs-mobile-contribute.api-docs-link-active {
      border-color: color-mix(in srgb, var(--link) 44%, var(--border));
      background: color-mix(in srgb, var(--surface-strong) 74%, var(--link));
      color: var(--link-hover);
      text-decoration: none;
    }

    .api-docs-mobile-group {
      display: grid;
      border-bottom: 1px solid var(--border);
    }

    .api-docs-mobile-group-explore {
      order: 2;
    }

    .api-docs-mobile-group-api {
      order: 3;
    }

    .api-docs-mobile-group-resources {
      order: 4;
    }

    .api-docs-mobile-group-button {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      cursor: pointer;
    }

    .api-docs-mobile-group-label {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-weight: 700;
    }

    .api-docs-mobile-submenu {
      display: none;
    }

    .api-docs-mobile-submenu-open {
      display: grid;
      gap: 0;
      padding: 0 0 8px 10px;
      border-left: 1px solid var(--border);
    }

    .api-docs-mobile-submenu a {
      display: flex;
      align-items: center;
      min-height: 38px;
      padding: 8px 10px;
      color: var(--text-main);
      text-decoration: none;
    }

    .api-docs-mobile-submenu a:hover,
    .api-docs-mobile-submenu a.api-docs-link-active {
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
      background:
        linear-gradient(
          180deg,
          color-mix(in srgb, var(--surface-strong) 42%, transparent),
          var(--bg)
        );
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
      display: grid;
      grid-template-columns: repeat(3, minmax(160px, 1fr));
      gap: clamp(22px, 5vw, 76px);
      flex-wrap: wrap;
      min-width: 280px;
      flex: 1 1 720px;
    }

    .api-docs-footer-col {
      display: flex;
      flex-direction: column;
      gap: 12px;
      min-width: 240px;
    }

    .api-docs-footer h3 {
      margin: 0;
      font-size: var(--text-label);
      line-height: 1.35;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--link);
      text-shadow: 0 0 18px color-mix(in srgb, var(--accent) 32%, transparent);
    }

    .api-docs-footer-links {
      display: grid;
      gap: 8px;
    }

    .api-docs-footer-links a {
      position: relative;
      color: color-mix(in srgb, var(--text-main) 88%, var(--link));
      text-decoration: none;
      font-size: var(--text-small);
      line-height: 1.55;
      width: fit-content;
      padding-left: 0;
      transition:
        color 140ms ease,
        padding-left 140ms ease;
    }

    .api-docs-footer-links a::before {
      position: absolute;
      left: 0;
      color: var(--accent);
      content: "->";
      opacity: 0;
      transform: translateX(-6px);
      transition:
        opacity 140ms ease,
        transform 140ms ease;
    }

    .api-docs-footer-links a:hover,
    .api-docs-footer-links a:focus-visible {
      color: var(--link-hover);
      padding-left: 1.05rem;
      outline: none;
      text-decoration: none;
    }

    .api-docs-footer-links a:hover::before,
    .api-docs-footer-links a:focus-visible::before {
      opacity: 1;
      transform: translateX(0);
    }

    .api-docs-footer-meta {
      display: flex;
      flex-direction: column;
      gap: 12px;
      align-items: stretch;
      flex: 0 0 auto;
      min-width: 188px;
    }

    .api-docs-footer-cta,
    .api-docs-footer-legacy,
    .api-docs-footer-github {
      display: inline-flex;
      justify-content: center;
      align-items: center;
      text-decoration: none;
      text-transform: uppercase;
      letter-spacing: 0.14em;
      font-size: var(--text-label);
      line-height: 1.35;
      text-align: center;
      padding: 0.58rem 0.76rem;
      border-radius: var(--radius-pill);
      background: color-mix(in srgb, var(--surface-strong) 82%, var(--accent));
      border: 1px solid color-mix(in srgb, var(--link) 34%, var(--border));
      color: var(--text-main);
      box-shadow:
        var(--shadow-sm),
        0 0 20px color-mix(in srgb, var(--accent) 14%, transparent);
    }

    .api-docs-footer-cta {
      color: #101827;
      background: linear-gradient(
        135deg,
        color-mix(in srgb, var(--accent) 58%, #fff),
        color-mix(in srgb, var(--accent) 74%, #fff)
      );
      border-color: color-mix(in srgb, var(--accent) 70%, var(--border));
    }

    .api-docs-footer-github {
      color: color-mix(in srgb, var(--text-main) 86%, var(--link));
      background: color-mix(in srgb, var(--surface-strong) 92%, var(--link));
    }

    .api-docs-footer-cta:hover,
    .api-docs-footer-legacy:hover,
    .api-docs-footer-github:hover {
      color: var(--link-hover);
      border-color: color-mix(in srgb, var(--link) 28%, var(--border));
      text-decoration: none;
    }

    .api-docs-footer-cta:hover {
      color: #101827;
      filter: brightness(1.05);
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

      .api-docs-footer-cols {
        grid-template-columns: 1fr;
        gap: 20px;
      }

      .api-docs-footer-col {
        min-width: 0;
      }

      .api-docs-footer-meta {
        align-items: flex-start;
        width: 100%;
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
      `  <style>\n${SITE_STYLES}\n  </style>\n  <link rel="icon" href="/images/favicon.ico" />\n</head>`,
    )
    .replace("<body>", `${bodyOpen}\n${SITE_HEADER}\n  <main class="api-docs-main">`)
    .replace("</body>", `  </main>\n${SITE_FOOTER}\n</body>`);
}
