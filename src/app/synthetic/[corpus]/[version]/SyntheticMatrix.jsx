"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { Eye, Search } from "lucide-react";

import SyntheticDropdown from "@/app/components/Synthetic/Dropdown/Dropdown";
import s from "./SyntheticMatrix.module.css";

const nf = new Intl.NumberFormat("en-US");
const nfCompact = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1,
});

function formatFull(value) {
  const number = Number(value);
  return Number.isFinite(number) ? nf.format(number) : "";
}

function formatCompact(value) {
  const number = Number(value);
  return Number.isFinite(number) ? nfCompact.format(number) : "";
}

function cellTone(sentences, maxSentences) {
  if (!sentences || !maxSentences) return "0%";
  const level = Math.log10(sentences + 1) / Math.log10(maxSentences + 1);
  const percentage = Math.max(14, Math.min(level * 44, 44));
  return `${percentage.toFixed(1)}%`;
}

function escapeSelectorValue(value) {
  if (typeof globalThis.CSS?.escape === "function") {
    return globalThis.CSS.escape(value);
  }

  return String(value).replace(/["\\]/g, "\\$&");
}

function addDownload(items, item, format) {
  if (!item?.url) return;
  items.push({
    format,
    url: String(item.url),
    size: item.size ?? null,
  });
}

function monoDownloadsFor(row, side) {
  const language = side === "source" ? row?.src_lang : row?.tgt_lang;
  const downloads = row?.downloads || {};
  const items = [];

  addDownload(
    items,
    side === "source" ? downloads.source_language : downloads.target_language,
    `raw ${language}`,
  );
  addDownload(
    items,
    side === "source"
      ? downloads.tokenized_source_language
      : downloads.tokenized_target_language,
    `tok ${language}`,
  );

  return items;
}

function uniqueDownloads(items = []) {
  const seen = new Set();
  return items.filter((item) => {
    const key = `${item.format}::${item.url}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function makeMatrix(rows = []) {
  const languages = new Set();
  const cells = [];
  const mono = new Map();

  for (const row of rows) {
    const source = String(row?.src_lang || "");
    const target = String(row?.tgt_lang || "");
    const pair = String(row?.lang_pair || [source, target].join("-"));
    if (!source || !target) continue;

    languages.add(source);
    languages.add(target);

    const bilingual = [];
    addDownload(bilingual, row?.downloads?.alignments, "xml");

    cells.push({
      key: pair,
      source,
      target,
      title: row?.langPairName || `${source} - ${target}`,
      sampleHref: `/synthetic/${encodeURIComponent(
        row?.name || "",
      )}/${encodeURIComponent(row?.version || "")}/${encodeURIComponent(
        pair,
      )}/sample`,
      sentences: Number(row?.alignments || 0),
      sourceTokens: Number(row?.src_tokens || 0),
      targetTokens: Number(row?.tgt_tokens || 0),
      valueLabel: formatCompact(row?.alignments),
      bilingual,
      mono: {
        [source]: monoDownloadsFor(row, "source"),
        [target]: monoDownloadsFor(row, "target"),
      },
    });

    const sourceItems = mono.get(source) || [];
    sourceItems.push(...monoDownloadsFor(row, "source"));
    mono.set(source, sourceItems);

    const targetItems = mono.get(target) || [];
    targetItems.push(...monoDownloadsFor(row, "target"));
    mono.set(target, targetItems);
  }

  return {
    languages: Array.from(languages).sort((a, b) => a.localeCompare(b)),
    cells,
    mono: Object.fromEntries(
      Array.from(mono.entries()).map(([language, items]) => [
        language,
        uniqueDownloads(items),
      ]),
    ),
    maxSentences: Math.max(...cells.map((cell) => cell.sentences), 0),
  };
}

function makeLookup(cells = []) {
  const lookup = new Map();
  for (const cell of cells) {
    lookup.set(`${cell.source}::${cell.target}`, cell);
    lookup.set(`${cell.target}::${cell.source}`, cell);
  }
  return lookup;
}

function DownloadHelp() {
  return (
    <span className={s.helpWrap}>
      <button
        type="button"
        className={s.help}
        aria-label="Download format help"
      >
        ?
      </button>
      <span className={s.tip} role="tooltip">
        XML contains alignment files. Raw files contain one untokenized language
        side; tok files contain the tokenized side.{" "}
        <a
          href="https://opus.nlpl.eu/legacy/trac/wiki/DataFormats.html"
          target="_blank"
          rel="noopener noreferrer"
        >
          More information
        </a>
      </span>
    </span>
  );
}

function DownloadTitle({ children }) {
  return (
    <h4 className={s.downloadTitle}>
      <span>{children}</span>
      <DownloadHelp />
    </h4>
  );
}

export default function SyntheticMatrix({ rows = [] }) {
  const [query, setQuery] = useState("");
  const [selectedKey, setSelectedKey] = useState("");
  const [selectedMono, setSelectedMono] = useState("");
  const tableRef = useRef(null);
  const hoverKeyRef = useRef("");
  const hoverElementsRef = useRef([]);

  const matrix = useMemo(() => makeMatrix(rows), [rows]);
  const { languages, cells, mono, maxSentences } = matrix;
  const isLargeMatrix = languages.length > 40;

  const lookup = useMemo(() => makeLookup(cells), [cells]);
  const selected = useMemo(
    () => cells.find((cell) => cell.key === selectedKey) || cells[0] || null,
    [cells, selectedKey],
  );

  const filteredLanguages = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return languages;
    return languages.filter((code) => code.toLowerCase().includes(needle));
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
    setSelectedMono(language);
  }

  const selectedMonoDownloads = selectedMono ? mono[selectedMono] : null;

  return (
    <div className={s.panel}>
      <div className={s.toolbar}>
        <div>
          <p className={s.eyebrow}>Language matrix</p>
          <h3>Synthetic pairs</h3>
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
        <p className={s.count}>
          {filteredLanguages.length} languages, {cells.length} pairs
        </p>
      </div>

      <div className={s.body}>
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
                  <th key={language} title={language} data-col-code={language}>
                    {language}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredLanguages.map((row) => (
                <tr key={row}>
                  <th title={row} data-row-code={row}>
                    {row}
                  </th>
                  {filteredLanguages.map((column) => {
                    const isMono = row === column;
                    const cell = lookup.get(`${row}::${column}`);
                    const hasMono = Boolean(mono[row]?.length);
                    const active =
                      (!selectedMono && cell?.key === selected?.key) ||
                      (selectedMono && isMono && selectedMono === row);
                    const tone = cellTone(cell?.sentences, maxSentences);

                    return (
                      <td
                        key={`${row}-${column}`}
                        data-row-code={row}
                        data-col-code={column}
                      >
                        {isMono && hasMono ? (
                          <button
                            type="button"
                            className={`${s.cell} ${s.monoCell} ${
                              active ? s.activeCell : ""
                            }`}
                            onClick={() => selectMono(row)}
                            title={`${row}: monolingual downloads`}
                          >
                            <span>{row}</span>
                          </button>
                        ) : isMono ? (
                          <span className={`${s.cell} ${s.monoCell}`}>
                            <span>{row}</span>
                          </span>
                        ) : cell ? (
                          <button
                            type="button"
                            className={`${s.cell} ${
                              active ? s.activeCell : ""
                            }`}
                            style={{ "--tone": tone }}
                            onClick={() => selectCell(cell)}
                            title={`${row}-${column}: ${formatFull(cell.sentences)} sentences`}
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
              <section className={s.downloads}>
                <DownloadTitle>Downloads</DownloadTitle>
                <div className={s.downloadRow}>
                  <span>{selectedMono}</span>
                  <SyntheticDropdown data={selectedMonoDownloads} />
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
                <DownloadTitle>Bilingual downloads</DownloadTitle>
                <div className={s.downloadRow}>
                  <span>
                    {selected.source}-{selected.target}
                  </span>
                  <SyntheticDropdown data={selected.bilingual} />
                </div>
              </section>
              <section className={s.downloads}>
                <DownloadTitle>Monolingual downloads</DownloadTitle>
                <div className={s.monoDownloads}>
                  {Object.entries(selected.mono).map(([language, downloads]) =>
                    downloads.length ? (
                      <div key={language} className={s.downloadRow}>
                        <span>{language}</span>
                        <SyntheticDropdown data={downloads} />
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
