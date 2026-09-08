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

export const dynamicParams = true;

const SMALL_CORPUS_PAIR_LIMIT = 12;
const MATRIX_PAIR_MIN = 4;
const MATRIX_LANGUAGE_LIMIT = 250;
const MATRIX_PAIR_LIMIT = 7500;

const SKIP = new Set([
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

function withCalculatedStats(info = {}, corpora = [], languages = []) {
  const sourceInfo = info ?? {};
  const missingStats = STATS_KEYS.some((key) => !hasStatValue(sourceInfo[key]));
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
      hasStatValue(sourceInfo[key]) ? sourceInfo[key] : value,
    ]),
  );
}

export async function generateStaticParams() {
  const corporaResponse = await callPythonReadData({ corpora: "True" });
  const corpora = Array.isArray(corporaResponse?.corpora)
    ? corporaResponse.corpora
    : [];

  return corpora
    .map((c) => String(c))
    .filter((c) => !SKIP.has(c.toLowerCase()))
    .map((corpus) => ({ corpus }));
}

function DatasetsFallback() {
  return <div style={{ padding: 16 }}>Loading filters…</div>;
}

export default async function CorpusPage({ params }) {
  const { corpus } = await params;

  if (!corpus) notFound();

  const base = process.env.BASE_REPO;
  if (!base) notFound();

  try {
    const [xmlResponse, languagesResponse, corpusInfo] = await Promise.all([
      callPythonReadData({ corpus, preprocessing: "xml", version: "latest" }),
      callPythonReadData({ languages: "True", corpus }),
      fetchYaml(`${base}/corpus/${corpus}/info.yaml`),
    ]);

    const corpora = Array.isArray(xmlResponse?.corpora)
      ? xmlResponse.corpora
      : [];
    const languages = Array.isArray(languagesResponse?.languages)
      ? languagesResponse.languages
      : [];

    // if (!corpora.length) notFound();

    const version = corpora?.[0]?.version ?? "";
    const graphValues = buildGraphValues(corpora, languages);
    const infoWithStats = withCalculatedStats(corpusInfo, corpora, languages);
    const latestPairCount = countUniquePairs(corpora);
    const shouldUseSmallResources =
      latestPairCount > 0 && latestPairCount <= SMALL_CORPUS_PAIR_LIMIT;
    const shouldPrepareMatrix =
      latestPairCount >= MATRIX_PAIR_MIN &&
      latestPairCount <= MATRIX_PAIR_LIMIT &&
      languages.length <= MATRIX_LANGUAGE_LIMIT;
    const resourceRows = shouldUseSmallResources || shouldPrepareMatrix
      ? await callPythonReadData({ corpus, version: "latest" })
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
              </h1>
            </header>

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

            {(description || cite) && (
              <div className={s.block}>
                {description && (
                  <SafeRichText className={s.content} html={description} />
                )}
                {cite && (
                  <SafeRichText className={s.content} html={cite} />
                )}

                {bibtexText && (
                  <div className={s.actions}>
                    <CopyBibtexButton text={bibtexText} />
                  </div>
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
                corpus={corpusInfo.name || corpus}
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
                    corpus={corpusInfo.name || corpus}
                    graphValues={graphValues}
                    matrix={matrix}
                  />
                </section>
              )}

              {/* 4) DOWNLOADS */}
              {languages.length > 0 && (
                <section id="download" className={s.section}>
                  <CorpusPageContainer
                    languageList={languages}
                    version={version}
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
