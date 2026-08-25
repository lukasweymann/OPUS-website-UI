import Link from "next/link";
import { Eye } from "lucide-react";

import TableDropdown from "@/app/components/CorporaSearchTable/TableDropdown/TableDropdown";
import { languagePairName } from "../../../../hooks/hooks";
import s from "./SmallCorpusResources.module.css";

const nf = new Intl.NumberFormat("en-US");

function formatNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? nf.format(number) : "";
}

function formatSize(value) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) return "";
  if (number >= 1024 * 1024) return `${(number / 1024 / 1024).toFixed(1)} GB`;
  if (number >= 1024) return `${(number / 1024).toFixed(1)} MB`;
  return `${number} KB`;
}

function formatLabel(row) {
  const preprocessing = String(row?.preprocessing || "");
  const source = String(row?.source || "");
  const url = String(row?.url || "");

  if (preprocessing === "mono" && url.includes(".txt")) return `txt ${source}`;
  if (preprocessing === "mono" && url.includes(".tok")) return `tok ${source}`;
  if (!row?.target && source) return `${preprocessing} ${source}`;
  return preprocessing;
}

function sortFormats(items = []) {
  const order = new Map([
    ["moses", 0],
    ["tmx", 1],
    ["xml", 2],
    ["txt", 3],
    ["tok", 4],
    ["raw", 5],
    ["freq", 6],
  ]);

  return [...items].sort((a, b) => {
    const aBase = String(a.format).split(" ")[0];
    const bBase = String(b.format).split(" ")[0];
    return (order.get(aBase) ?? 99) - (order.get(bBase) ?? 99);
  });
}

function preferFormat(items = [], preferences = ["moses", "xml"]) {
  for (const preference of preferences) {
    const hit = items.find((item) => item.format.split(" ")[0] === preference);
    if (hit) return [hit];
  }

  return items[0] ? [items[0]] : [];
}

function toDropdownItems(items = []) {
  return sortFormats(items).map((item) => ({
    format: item.size ? `${item.format} ${item.size}` : item.format,
    url: item.url,
  }));
}

function compactNumber(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "";
  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(number);
}

function chooseStats(rows = []) {
  const preferred =
    rows.find((row) => row.preprocessing === "moses") ||
    rows.find((row) => row.preprocessing === "xml") ||
    rows[0] ||
    {};

  return {
    sentences: preferred.alignment_pairs,
    sourceTokens: preferred.source_tokens,
    targetTokens: preferred.target_tokens,
  };
}

function sumRows(rows = [], key) {
  return rows.reduce((total, row) => total + Number(row?.[key] || 0), 0);
}

function makePairTitle(source, target) {
  const names = languagePairName([source, target]);
  return `${names?.[0]?.label || source} - ${names?.[1]?.label || target}`;
}

function FormatDropdown({ items = [], preferences }) {
  if (!items.length) return <span className={s.empty}>Unavailable</span>;

  const dropdownItems = toDropdownItems(items);
  const defaultFormat = preferFormat(dropdownItems, preferences);

  return (
    <div className={s.dropdown}>
      <TableDropdown data={dropdownItems} defaultFormat={defaultFormat} />
    </div>
  );
}

function MonoFormats({ mono = {} }) {
  const entries = Object.entries(mono).filter(([, items]) => items.length);
  if (!entries.length) return <span className={s.empty}>Unavailable</span>;

  return (
    <div className={s.monoList}>
      {entries.map(([language, items]) => (
        <div key={language} className={s.monoGroup}>
          <span className={s.langCode}>{language}</span>
          <FormatDropdown items={items} preferences={["txt", "xml", "raw"]} />
        </div>
      ))}
    </div>
  );
}

export function buildCorpusResources(rows = []) {
  const pairGroups = new Map();
  const monoGroups = new Map();

  for (const row of rows) {
    const source = String(row?.source || "");
    const target = String(row?.target || "");
    const version = String(row?.version || "");
    const url = String(row?.url || "");
    if (!source || !url) continue;

    const item = {
      format: formatLabel(row),
      url,
      size: formatSize(row?.size),
    };

    if (target) {
      const key = `${source}&${target}&${version}`;
      const current = pairGroups.get(key) || {
        key,
        corpus: String(row?.corpus || ""),
        source,
        target,
        version,
        statsRows: [],
        bilingual: [],
      };

      current.statsRows.push(row);
      current.bilingual.push(item);
      pairGroups.set(key, current);
    } else {
      const current = monoGroups.get(source) || [];
      current.push(item);
      monoGroups.set(source, current);
    }
  }

  return Array.from(pairGroups.values())
    .map((pair) => ({
      ...pair,
      title: makePairTitle(pair.source, pair.target),
      sampleHref: `/datasets/${pair.corpus}/${pair.version}/${pair.source}&${pair.target}/sample`,
      stats: chooseStats(pair.statsRows),
      mono: {
        [pair.source]: monoGroups.get(pair.source) || [],
        [pair.target]: monoGroups.get(pair.target) || [],
      },
    }))
    .sort((a, b) => a.title.localeCompare(b.title));
}

export function buildSmallCorpusResources(rows = []) {
  return buildCorpusResources(rows);
}

export function buildCorpusMatrix(rows = [], languageCodes = []) {
  const resources = buildCorpusResources(rows);
  const allowedLanguages = new Set(languageCodes.filter(Boolean).map(String));
  const hasLanguageFilter = allowedLanguages.size > 0;
  const matrixResources = resources.filter(
    (resource) =>
      !hasLanguageFilter ||
      (allowedLanguages.has(resource.source) &&
        allowedLanguages.has(resource.target)),
  );
  const languageSet = new Set(
    hasLanguageFilter
      ? allowedLanguages
      : matrixResources.flatMap((resource) => [
          resource.source,
          resource.target,
        ]),
  );
  const monoGroups = new Map();

  const monoRows = rows.filter((row) => row?.source && !row?.target);
  for (const row of monoRows) {
    const source = String(row.source);
    if (hasLanguageFilter && !languageSet.has(source)) continue;
    if (!hasLanguageFilter) languageSet.add(source);

    const current = monoGroups.get(source) || [];
    current.push({
      format: formatLabel(row),
      url: String(row.url || ""),
      size: formatSize(row?.size),
    });
    monoGroups.set(source, current);
  }

  const names = languagePairName(Array.from(languageSet));
  const labels = new Map(
    names.map((item) => [item.value, item.label || item.value]),
  );

  const languages = Array.from(languageSet)
    .sort((a, b) => a.localeCompare(b))
    .map((code) => {
      const monoForLanguage = monoRows.filter((row) => row.source === code);
      return {
        code,
        label: labels.get(code) || code,
        files: sumRows(monoForLanguage, "documents"),
        tokens: sumRows(monoForLanguage, "source_tokens"),
        sentences: sumRows(monoForLanguage, "alignment_pairs"),
      };
    });

  const cells = matrixResources.map((resource) => ({
    key: resource.key,
    source: resource.source,
    target: resource.target,
    title: resource.title,
    sampleHref: resource.sampleHref,
    sentences: Number(resource.stats.sentences || 0),
    sourceTokens: Number(resource.stats.sourceTokens || 0),
    targetTokens: Number(resource.stats.targetTokens || 0),
    valueLabel: compactNumber(resource.stats.sentences),
    bilingual: toDropdownItems(resource.bilingual),
    bilingualDefault: preferFormat(toDropdownItems(resource.bilingual)),
    mono: Object.fromEntries(
      Object.entries(resource.mono).map(([language, items]) => {
        const dropdownItems = toDropdownItems(items);
        return [
          language,
          {
            items: dropdownItems,
            defaultFormat: preferFormat(dropdownItems, ["txt", "xml", "raw"]),
          },
        ];
      }),
    ),
  }));

  return {
    languages,
    cells,
    mono: Object.fromEntries(
      Array.from(monoGroups.entries()).map(([language, items]) => {
        const dropdownItems = toDropdownItems(items);
        return [
          language,
          {
            items: dropdownItems,
            defaultFormat: preferFormat(dropdownItems, ["txt", "xml", "raw"]),
          },
        ];
      }),
    ),
    maxSentences: Math.max(...cells.map((cell) => cell.sentences), 0),
  };
}

function SinglePairResources({ resource }) {
  return (
    <div className={s.single}>
      <div className={s.singleHead}>
        <div>
          <p className={s.eyebrow}>Available language pair</p>
          <h3>{resource.title}</h3>
          <p className={s.version}>{resource.version}</p>
        </div>
        <Link className={s.sampleLink} href={resource.sampleHref}>
          <Eye size={17} aria-hidden="true" />
          <span>Sample</span>
        </Link>
      </div>

      <dl className={s.stats}>
        <div>
          <dt>Sentences</dt>
          <dd>{formatNumber(resource.stats.sentences)}</dd>
        </div>
        <div>
          <dt>{resource.source} tokens</dt>
          <dd>{formatNumber(resource.stats.sourceTokens)}</dd>
        </div>
        <div>
          <dt>{resource.target} tokens</dt>
          <dd>{formatNumber(resource.stats.targetTokens)}</dd>
        </div>
      </dl>

      <div className={s.downloadGrid}>
        <section>
          <h4>Bilingual downloads</h4>
          <FormatDropdown items={resource.bilingual} />
        </section>
        <section>
          <h4>Monolingual downloads</h4>
          <MonoFormats mono={resource.mono} />
        </section>
      </div>
    </div>
  );
}

function ResourcesTable({ resources }) {
  return (
    <div className={s.tableWrap}>
      <table className={s.table}>
        <thead>
          <tr>
            <th>Language pair</th>
            <th className={s.num}>Sentences</th>
            <th className={s.num}>Tokens</th>
            <th>Sample</th>
            <th>Bilingual</th>
            <th>Monolingual</th>
          </tr>
        </thead>
        <tbody>
          {resources.map((resource) => (
            <tr key={resource.key}>
              <th scope="row">
                <span className={s.pairTitle}>{resource.title}</span>
                <span className={s.version}>{resource.version}</span>
              </th>
              <td className={s.num}>
                {formatNumber(resource.stats.sentences)}
              </td>
              <td className={s.num}>
                <span>
                  {resource.source}: {formatNumber(resource.stats.sourceTokens)}
                </span>
                <span>
                  {resource.target}: {formatNumber(resource.stats.targetTokens)}
                </span>
              </td>
              <td>
                <Link className={s.iconLink} href={resource.sampleHref}>
                  <Eye size={17} aria-hidden="true" />
                  <span className={s.srOnly}>View sample</span>
                </Link>
              </td>
              <td>
                <FormatDropdown items={resource.bilingual} />
              </td>
              <td>
                <MonoFormats mono={resource.mono} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function SmallCorpusResources({ resources = [] }) {
  if (!resources.length) return null;

  const single = resources.length === 1;

  return (
    <section id="download" className={s.wrap} aria-labelledby="resources-title">
      <header className={s.head}>
        <p className={s.eyebrow}>Downloads</p>
        <h2 id="resources-title">Available resources</h2>
        <p>
          This corpus has{" "}
          {single ? "one language pair" : `${resources.length} language pairs`},
          so the resources are listed directly.
        </p>
      </header>

      {single ? (
        <SinglePairResources resource={resources[0]} />
      ) : (
        <ResourcesTable resources={resources} />
      )}

      <p className={s.note}>
        TMX files contain unique translation units. Moses downloads include all
        non-empty alignment units, including duplicates.
      </p>
    </section>
  );
}
