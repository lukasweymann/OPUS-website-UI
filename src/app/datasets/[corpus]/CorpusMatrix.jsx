"use client";

import Link from "next/link";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Eye, Search } from "lucide-react";

import TableDropdown from "@/app/components/CorporaSearchTable/TableDropdown/TableDropdown";
import s from "./CorpusMatrix.module.css";

const nf = new Intl.NumberFormat("en-US");

function formatFull(value) {
  const number = Number(value);
  return Number.isFinite(number) ? nf.format(number) : "";
}

function cellTone(sentences, maxSentences) {
  if (!sentences || !maxSentences) return "0%";
  const level = Math.log10(sentences + 1) / Math.log10(maxSentences + 1);
  const percentage = Math.max(14, Math.min(level * 44, 44));
  return `${percentage.toFixed(1)}%`;
}

function makeLookup(cells = []) {
  const lookup = new Map();
  for (const cell of cells) {
    lookup.set(`${cell.source}::${cell.target}`, cell);
    lookup.set(`${cell.target}::${cell.source}`, cell);
  }
  return lookup;
}

function escapeSelectorValue(value) {
  if (typeof globalThis.CSS?.escape === "function") {
    return globalThis.CSS.escape(value);
  }

  return String(value).replace(/["\\]/g, "\\$&");
}

const DOWNLOAD_HELP = {
  bilingual: {
    title: "Download formats",
    items: [
      ["moses", "aligned plain text files"],
      ["TMX", "translation memories"],
      ["XML", "sentence alignments in XCES Align format"],
    ],
  },
  monolingual: {
    title: "Download formats",
    items: [
      ["xml-raw", "Basic XML-encoded corpus files"],
      ["xml-tok", "Tokenized XML-encoded corpus files"],
      ["txt-raw", "raw plain text files"],
      ["txt-tok", "tokenized plain text files"],
    ],
  },
};

function DownloadHelp({ type = "bilingual" }) {
  const [open, setOpen] = useState(false);
  const [tipStyle, setTipStyle] = useState(null);
  const buttonRef = useRef(null);
  const closeTimerRef = useRef(null);

  function showTip() {
    window.clearTimeout(closeTimerRef.current);
    setOpen(true);
  }

  function hideTip() {
    window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = window.setTimeout(() => {
      setOpen(false);
      setTipStyle(null);
    }, 120);
  }

  useLayoutEffect(() => {
    if (!open) return;

    function updatePosition() {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (!rect) return;

      const viewportPad = 8;
      const gap = 8;
      const width = Math.min(360, window.innerWidth - viewportPad * 2);
      const left = Math.min(
        Math.max(viewportPad, rect.left + rect.width / 2 - width / 2),
        window.innerWidth - width - viewportPad,
      );
      const help = DOWNLOAD_HELP[type] || DOWNLOAD_HELP.bilingual;
      const estimatedHeight = 86 + help.items.length * 34;
      const top =
        rect.top > estimatedHeight + gap + viewportPad
          ? rect.top - estimatedHeight - gap
          : rect.bottom + gap;

      setTipStyle({
        position: "fixed",
        top: `${top}px`,
        bottom: "auto",
        left: `${left}px`,
        width: `${width}px`,
      });
    }

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, type]);

  const help = DOWNLOAD_HELP[type] || DOWNLOAD_HELP.bilingual;
  const tooltip = (
    <div
      className={`${s.tip} ${s.tipPortal}`}
      role="tooltip"
      style={tipStyle || undefined}
      onPointerEnter={showTip}
      onPointerLeave={hideTip}
      onFocus={showTip}
      onBlur={hideTip}
    >
      <p className={s.tipTitle}>{help.title}</p>
      <ul className={s.tipList}>
        {help.items.map(([name, description]) => (
          <li key={name}>
            <strong>{name}</strong>
            <span>{description}</span>
          </li>
        ))}
      </ul>
      <a href="/download-formats">More information</a>
    </div>
  );

  return (
    <span
      className={s.helpWrap}
      onPointerEnter={showTip}
      onPointerLeave={hideTip}
      onFocus={showTip}
      onBlur={hideTip}
    >
      <button
        ref={buttonRef}
        type="button"
        className={s.help}
        aria-label="Download format help"
      >
        ?
      </button>
      {open && tipStyle && createPortal(tooltip, document.body)}
    </span>
  );
}

function DownloadTitle({ children, type = "bilingual" }) {
  return (
    <h4 className={s.downloadTitle}>
      <span>{children}</span>
      <DownloadHelp type={type} />
    </h4>
  );
}

export default function CorpusMatrix({ corpus, matrix }) {
  const [query, setQuery] = useState("");
  const [selectedKey, setSelectedKey] = useState(matrix?.cells?.[0]?.key ?? "");
  const [selectedMono, setSelectedMono] = useState("");
  const tableRef = useRef(null);
  const hoverKeyRef = useRef("");
  const hoverElementsRef = useRef([]);

  const languages = Array.isArray(matrix?.languages) ? matrix.languages : [];
  const cells = Array.isArray(matrix?.cells) ? matrix.cells : [];
  const mono = matrix?.mono || {};
  const summary = matrix?.summary || {};
  const maxSentences = Number(matrix?.maxSentences || 0);
  const isLargeMatrix = languages.length > 40;

  const lookup = useMemo(() => makeLookup(cells), [cells]);
  const selected = useMemo(
    () => cells.find((cell) => cell.key === selectedKey) || cells[0] || null,
    [cells, selectedKey],
  );

  const filteredLanguages = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return languages;

    return languages.filter(
      (language) =>
        language.code.toLowerCase().includes(needle) ||
        language.label.toLowerCase().includes(needle),
    );
  }, [languages, query]);

  if (!languages.length || !cells.length) return null;

  function clearMatrixHover() {
    hoverKeyRef.current = "";
    for (const element of hoverElementsRef.current) {
      element.classList.remove(s.hoverLine, s.hoverHead);
    }
    hoverElementsRef.current = [];
  }

  function updateMatrixHover(event) {
    const table = tableRef.current;
    const target =
      event.target instanceof Element
        ? event.target.closest("[data-row-code], [data-col-code]")
        : null;

    if (!table || !target || !table.contains(target)) {
      clearMatrixHover();
      return;
    }

    const rowCode = target.dataset.rowCode || "";
    const colCode = target.dataset.colCode || "";
    const hoverKey = `${rowCode}::${colCode}`;
    if (hoverKey === hoverKeyRef.current) return;

    clearMatrixHover();
    hoverKeyRef.current = hoverKey;

    const selectors = [];
    if (rowCode) {
      selectors.push(`[data-row-code="${escapeSelectorValue(rowCode)}"]`);
    }
    if (colCode) {
      selectors.push(`[data-col-code="${escapeSelectorValue(colCode)}"]`);
    }
    if (!selectors.length) return;

    const elements = Array.from(table.querySelectorAll(selectors.join(",")));
    for (const element of elements) {
      element.classList.add(s.hoverLine);
      if (element.tagName === "TH") element.classList.add(s.hoverHead);
    }
    hoverElementsRef.current = elements;
  }

  function selectCell(cell) {
    setSelectedKey(cell.key);
    setSelectedMono("");
  }

  function selectMono(language) {
    setSelectedMono(language.code);
  }

  const selectedMonoDownloads = selectedMono ? mono[selectedMono] : null;
  const matrixHeight = `${(filteredLanguages.length + 1) * (isLargeMatrix ? 2.15 : 2.35)}rem`;
  const languageCount = summary.languages || languages.length;
  const bitextCount = summary.bitexts || cells.length;
  const hasFilter = query.trim().length > 0;
  const countLabel = hasFilter
    ? `${filteredLanguages.length} shown, ${languageCount} languages, ${bitextCount} bitexts`
    : `${languageCount} languages, ${bitextCount} bitexts`;

  return (
    <div className={s.panel}>
      <div className={s.toolbar}>
        <div>
          <p className={s.eyebrow}>Language matrix</p>
          <h3>{corpus}</h3>
          <p className={s.hint}>
            Click a bilingual cell or a language diagonal to show downloads.
          </p>
        </div>
        <label className={s.search}>
          <Search size={15} aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter languages..."
            aria-label="Filter languages"
          />
        </label>
        <p className={s.count}>{countLabel}</p>
      </div>

      <div className={s.body} style={{ "--matrix-height": matrixHeight }}>
        <div className={s.matrixWrap}>
          <table
            ref={tableRef}
            className={`${s.matrix} ${isLargeMatrix ? s.matrixLarge : ""}`}
            onPointerOver={updateMatrixHover}
            onPointerLeave={clearMatrixHover}
            onFocus={updateMatrixHover}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) {
                clearMatrixHover();
              }
            }}
          >
            <thead>
              <tr>
                <th className={s.corner}>lang</th>
                {filteredLanguages.map((language) => (
                  <th
                    key={language.code}
                    title={language.label}
                    data-col-code={language.code}
                  >
                    {language.code}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredLanguages.map((row) => (
                <tr key={row.code}>
                  <th title={row.label} data-row-code={row.code}>
                    {row.code}
                  </th>
                  {filteredLanguages.map((column) => {
                    const isMono = row.code === column.code;
                    const cell = lookup.get(`${row.code}::${column.code}`);
                    const hasMono = Boolean(mono[row.code]?.items?.length);
                    const active =
                      (!selectedMono && cell?.key === selected?.key) ||
                      (selectedMono && isMono && selectedMono === row.code);
                    const tone = cellTone(cell?.sentences, maxSentences);

                    return (
                      <td
                        key={`${row.code}-${column.code}`}
                        data-row-code={row.code}
                        data-col-code={column.code}
                      >
                        {isMono && hasMono ? (
                          <button
                            type="button"
                            className={`${s.cell} ${s.monoCell} ${
                              active ? s.activeCell : ""
                            }`}
                            onClick={() => selectMono(row)}
                            title={`${row.label}: ${formatFull(row.sentences)} sentences`}
                          >
                            <span>{row.code}</span>
                          </button>
                        ) : isMono ? (
                          <span className={`${s.cell} ${s.monoCell}`}>
                            <span>{row.code}</span>
                          </span>
                        ) : cell ? (
                          <button
                            type="button"
                            className={`${s.cell} ${
                              active ? s.activeCell : ""
                            }`}
                            style={{ "--tone": tone }}
                            onClick={() => selectCell(cell)}
                            title={`${row.code}-${column.code}: ${formatFull(cell.sentences)} sentences`}
                          >
                            <span>{cell.valueLabel}</span>
                          </button>
                        ) : (
                          <span className={`${s.cell} ${s.emptyCell}`} />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <aside className={s.detail}>
          {selectedMono && selectedMonoDownloads ? (
            <>
              <p className={s.eyebrow}>Monolingual</p>
              <h3>{selectedMono}</h3>
              <dl className={s.detailStats}>
                <div>
                  <dt>Sentences</dt>
                  <dd>
                    {formatFull(
                      languages.find((item) => item.code === selectedMono)
                        ?.sentences,
                    )}
                  </dd>
                </div>
                <div>
                  <dt>Tokens</dt>
                  <dd>
                    {formatFull(
                      languages.find((item) => item.code === selectedMono)
                        ?.tokens,
                    )}
                  </dd>
                </div>
              </dl>
              <section className={s.downloads}>
                <DownloadTitle type="monolingual">Downloads</DownloadTitle>
                <div className={s.downloadRow}>
                  <span>{selectedMono}</span>
                  <TableDropdown
                    data={selectedMonoDownloads.items}
                    defaultFormat={selectedMonoDownloads.defaultFormat}
                    portalMenu
                  />
                </div>
              </section>
            </>
          ) : selected ? (
            <>
              <p className={s.eyebrow}>Language pair</p>
              <h3>{selected.title}</h3>
              <dl className={s.detailStats}>
                <div>
                  <dt>Sentences</dt>
                  <dd>{formatFull(selected.sentences)}</dd>
                </div>
                <div>
                  <dt>{selected.source} tokens</dt>
                  <dd>{formatFull(selected.sourceTokens)}</dd>
                </div>
                <div>
                  <dt>{selected.target} tokens</dt>
                  <dd>{formatFull(selected.targetTokens)}</dd>
                </div>
              </dl>
              <div className={s.detailActions}>
                <Link className={s.sample} href={selected.sampleHref}>
                  <Eye size={16} aria-hidden="true" />
                  <span>Sample</span>
                </Link>
              </div>
              <section className={s.downloads}>
                <DownloadTitle type="bilingual">
                  Bilingual downloads
                </DownloadTitle>
                <div className={s.downloadRow}>
                  <span>
                    {selected.source}-{selected.target}
                  </span>
                  <TableDropdown
                    data={selected.bilingual}
                    defaultFormat={selected.bilingualDefault}
                    portalMenu
                  />
                </div>
              </section>
              <section className={s.downloads}>
                <DownloadTitle type="monolingual">
                  Monolingual downloads
                </DownloadTitle>
                <div className={s.monoDownloads}>
                  {Object.entries(selected.mono).map(([language, downloads]) =>
                    downloads.items?.length ? (
                      <div key={language} className={s.downloadRow}>
                        <span>{language}</span>
                        <TableDropdown
                          data={downloads.items}
                          defaultFormat={downloads.defaultFormat}
                          portalMenu
                        />
                      </div>
                    ) : null,
                  )}
                </div>
              </section>
            </>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
