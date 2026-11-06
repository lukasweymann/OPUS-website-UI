import Link from "next/link";
import { notFound } from "next/navigation";
import yaml from "js-yaml";
import { Suspense } from "react";

import CorpusPageContainer from "@/app/components/Dataset/Container/Container";
import CorpusDisclaimer from "@/app/components/Dataset/Disclaimer/Disclaimer";
import StatsTable from "@/app/components/Dataset/Stats/Stats";
import CopyBibtexButton from "./CopyBibtexButton";
import SafeRichText from "@/app/components/ui/SafeRichText/SafeRichText";
import CorpusExplorerTabs from "./CorpusExplorerTabs";
import {
  buildCorpusMatrix,
  buildSmallCorpusResources,
} from "./SmallCorpusResources";

import s from "./page.module.css";
import { callPythonReadData } from "@/lib/pythonClient";

const SMALL_CORPUS_PAIR_LIMIT = 12;
const MATRIX_PAIR_MIN = 4;
const MATRIX_LANGUAGE_LIMIT = 250;
const MATRIX_PAIR_LIMIT = 7500;

export const SKIP = new Set([
  "komi",
  "mpc1",
  "un",
  "elra-w0245",
  "elra-w0248",
  "elrc_416",
]);

async function fetchYaml(url) {
  const res = await fetch(url);
  if (!res.ok) return null;
  const text = await res.text();
  return yaml.load(text);
}

function buildGraphValues(corpora = [], languages = []) {
  // accumulate in one pass
  const totals = new Map();
  for (const lang of languages) totals.set(lang, 0);

  for (const row of corpora) {
    const n = Number(row?.alignment_pairs ?? 0);
    if (!n) continue;
    const a = row?.source;
    const b = row?.target;
    if (a && totals.has(a)) totals.set(a, totals.get(a) + n);
    if (b && totals.has(b)) totals.set(b, totals.get(b) + n);
  }

  return Array.from(totals.entries())
    .filter(([, sentences]) => sentences > 0)
    .map(([name, sentences]) => ({ name, perc: 0, sentences }));
}

function countUniquePairs(corpora = []) {
  const pairs = new Set();

  for (const row of corpora) {
    if (!row?.source || !row?.target) continue;
    pairs.add(`${row.source}&${row.target}`);
  }

  return pairs.size;
}

const STATS_KEYS = [
  "number_of_languages",
  "bitexts",
  "number_of_files",
  "total_number_of_tokens",
  "total_sentence_fragments",
];

function hasStatValue(value) {
  return value !== undefined && value !== null && value !== "";
}

function compactStat(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "";
  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(number);
}

function withCalculatedStats(info = {}, corpora = [], languages = [], force = false) {
  const sourceInfo = info ?? {};
  const missingStats = force || STATS_KEYS.some((key) => !hasStatValue(sourceInfo[key]));
  if (!missingStats) return sourceInfo;

  const languageSet = new Set(languages.filter(Boolean).map(String));
  const isKnownLanguage = (code) =>
    languageSet.size === 0 || languageSet.has(String(code));

  const bitextRows = corpora.filter(
    (row) =>
      row?.source &&
      row?.target &&
      isKnownLanguage(row.source) &&
      isKnownLanguage(row.target),
  );
  const monoRows = corpora.filter(
    (row) => row?.source && !row?.target && isKnownLanguage(row.source),
  );
  const totalsRows = monoRows.length ? monoRows : bitextRows;

  const languageCount =
    languageSet.size ||
    new Set(
      corpora.flatMap((row) => [row?.source, row?.target].filter(Boolean)),
    ).size;

  const sum = (rows, key) =>
    rows.reduce((total, row) => total + Number(row?.[key] || 0), 0);

  const calculated = {
    number_of_languages: languageCount || "",
    bitexts: bitextRows.length || "",
    number_of_files: sum(totalsRows, "documents") || "",
    total_number_of_tokens: compactStat(
      monoRows.length
        ? sum(monoRows, "source_tokens")
        : sum(bitextRows, "source_tokens") + sum(bitextRows, "target_tokens"),
    ),
    total_sentence_fragments: compactStat(sum(totalsRows, "alignment_pairs")),
  };

  return Object.fromEntries(
    Object.entries({ ...sourceInfo, ...calculated }).map(([key, value]) => [
      key,
      !force && hasStatValue(sourceInfo[key]) ? sourceInfo[key] : value,
    ]),
  );
}

function DatasetsFallback() {
  return <div style={{ padding: 16 }}>Loading filters…</div>;
}

export default async function CorpusReleasePage({ corpus, requestedVersion = "latest" }) {
  if (!corpus) notFound();

  const base = process.env.BASE_REPO;
  if (!base) notFound();

  try {
    const [xmlResponse, languagesResponse, corpusInfo, releasesResponse] = await Promise.all([
      callPythonReadData({ corpus, preprocessing: "xml", version: requestedVersion }),
      callPythonReadData({ languages: "True", corpus, version: requestedVersion }),
      fetchYaml(`${base}/corpus/${corpus}/info.yaml`),
      callPythonReadData({ versions: "True", corpus }),
    ]);
    const releases = Array.isArray(releasesResponse?.versions)
      ? releasesResponse.versions
      : [];
    const selectedRelease = requestedVersion === "latest"
      ? releases.find((release) => release.latest)
      : releases.find((release) => release.version === requestedVersion);
    if (requestedVersion !== "latest" && !selectedRelease) notFound();

    const corpora = Array.isArray(xmlResponse?.corpora)
      ? xmlResponse.corpora
      : [];
    const languages = Array.isArray(languagesResponse?.languages)
      ? languagesResponse.languages
      : [];

    // if (!corpora.length) notFound();

    const version = selectedRelease?.version ?? corpora?.[0]?.version ?? "";
    const isLatest = requestedVersion === "latest" || Boolean(selectedRelease?.latest);
    const pagePath = `/datasets/${encodeURIComponent(corpus)}${requestedVersion === "latest" ? "" : `/${encodeURIComponent(requestedVersion)}`}`;
    const graphValues = buildGraphValues(corpora, languages);
    const infoWithStats = withCalculatedStats(corpusInfo, corpora, languages, !isLatest);
    const latestPairCount = countUniquePairs(corpora);
    const shouldUseSmallResources =
      latestPairCount > 0 && latestPairCount <= SMALL_CORPUS_PAIR_LIMIT;
    const shouldPrepareMatrix =
      latestPairCount >= MATRIX_PAIR_MIN &&
      latestPairCount <= MATRIX_PAIR_LIMIT &&
      languages.length <= MATRIX_LANGUAGE_LIMIT;
    const resourceRows = shouldUseSmallResources || shouldPrepareMatrix
      ? await callPythonReadData({ corpus, version: requestedVersion })
      : null;
    const smallResources = shouldUseSmallResources
      ? buildSmallCorpusResources(resourceRows?.corpora ?? [], corpora)
      : [];
    const showSmallResources =
      smallResources.length > 0 &&
      smallResources.length <= SMALL_CORPUS_PAIR_LIMIT;
    const matrix = shouldPrepareMatrix
      ? buildCorpusMatrix(resourceRows?.corpora ?? [], languages, {
          statsRows: corpora,
          summary: infoWithStats,
        })
      : null;
    const showMatrix = Boolean(
      matrix?.languages?.length && matrix?.cells?.length,
    );

    const bibtexText = corpusInfo?.bibtex
      ? Buffer.from(corpusInfo.bibtex, "base64").toString("utf8")
      : "";

    const latest = corpusInfo?.latest_release ? corpusInfo.latest_release : "";

    const license = corpusInfo?.license ? corpusInfo.license : "";

    const copyright = corpusInfo?.copyright ? corpusInfo.copyright : "";

    const description = corpusInfo?.description ? corpusInfo.description : "";

    const cite = corpusInfo?.cite ? corpusInfo.cite : "";
    const preEnd = /<\/pre\s*>/i.exec(cite);
    const citationLead = preEnd ? cite.slice(0, preEnd.index + preEnd[0].length) : cite;
    const citationTail = preEnd ? cite.slice(preEnd.index + preEnd[0].length) : "";

    function isEmpty(obj) {
      for (const _ in obj) return false;
      return true;
    }

    const statsEmpty = isEmpty(corpusInfo);

    return (
      <Suspense fallback={<DatasetsFallback />}>
        <main className={s.wrap}>
          <section className={s.card}>
            <header className={s.cardHead}>
              <Link href="#download" className={s.dl}>
                Download
              </Link>

              <h1 className={s.title}>
                {corpusInfo.name}
                {version && <span className={s.ver}>{version}</span>}
                {version && isLatest && <span className={s.latestTag}>Latest</span>}
              </h1>
            </header>

            {releases.length > 1 && (
              <nav className={s.releases} aria-label="Corpus releases">
                <span>Releases:</span>
                {releases.map((release) => (
                  <Link
                    key={release.version}
                    href={release.latest
                      ? `/datasets/${encodeURIComponent(corpus)}`
                      : `/datasets/${encodeURIComponent(corpus)}/${encodeURIComponent(release.version)}`}
                    aria-current={release.version === version ? "page" : undefined}
                  >
                    {release.version}{release.latest && " (latest)"}
                  </Link>
                ))}
              </nav>
            )}

            {(latest || license) && (
              <div className={s.metaGrid}>
                {latest && (
                  <div className={s.meta}>
                    <span className={s.metaKey}>Latest release</span>
                    <span className={s.metaVal}>{latest}</span>
                  </div>
                )}

                {license && (
                  <div className={s.meta}>
                    <span className={s.metaKey}>License</span>
                    <SafeRichText
                      as="span"
                      className={s.metaVal}
                      html={license}
                    />
                  </div>
                )}
              </div>
            )}

            {copyright && (
              <div className={s.block}>
                <h2 className={s.h2}>Copyright</h2>
                <SafeRichText className={s.content} html={copyright} />
              </div>
            )}

            {(description || cite || bibtexText) && (
              <div className={s.block}>
                {description && (
                  <SafeRichText className={s.content} html={description} />
                )}
                {(cite || bibtexText) && (
                  <section className={s.citationSection} aria-label="Citation">
                    <h2 className={s.h2}>How to cite</h2>
                    {cite ? (
                      <SafeRichText
                        className={`${s.content} ${s.citation} ${preEnd && bibtexText ? s.citationWithCopy : ""}`}
                        html={citationLead}
                      />
                    ) : (
                      <pre className={s.citation}>{bibtexText}</pre>
                    )}
                    {bibtexText && (
                      <div className={s.citationActions}>
                        <CopyBibtexButton text={bibtexText} />
                      </div>
                    )}
                    {citationTail && (
                      <SafeRichText className={s.content} html={citationTail} />
                    )}
                  </section>
                )}
              </div>
            )}
          </section>
          {/* 3) STATS TABLE */}
          {!statsEmpty && (
            <section className={s.section}>
              <StatsTable info={infoWithStats} />
            </section>
          )}

          {showSmallResources ? (
            <section id="download" className={s.section}>
              <CorpusExplorerTabs
                key={version}
                corpus={corpus}
                version={version}
                pagePath={pagePath}
                matrix={matrix}
                resources={smallResources}
              />
            </section>
          ) : (
            <>
              {/* 2) LANGUAGE GRAPHS */}
              {(graphValues.length > 0 || showMatrix) && (
                <section className={s.section}>
                  <CorpusExplorerTabs
                    key={version}
                    corpus={corpus}
                    version={version}
                    pagePath={pagePath}
                    graphValues={graphValues}
                    matrix={matrix}
                  />
                </section>
              )}

              {/* 4) DOWNLOADS */}
              {languages.length > 0 && (
                <section id="download" className={s.section}>
                  <CorpusPageContainer
                    key={version}
                    languageList={languages}
                    version={version}
                    pagePath={pagePath}
                  />
                </section>
              )}
            </>
          )}
          <CorpusDisclaimer />
        </main>
      </Suspense>
    );
  } catch (error) {
    notFound();
  }
}
