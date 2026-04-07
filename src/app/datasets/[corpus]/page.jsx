import Link from "next/link";
import { notFound } from "next/navigation";
import yaml from "js-yaml";
import { Suspense } from "react";

import CorpusPageContainer from "@/app/components/Dataset/Container/Container";
import CorpusDisclaimer from "@/app/components/Dataset/Disclaimer/Disclaimer";
import dynamic from "next/dynamic";
const LanguageGraphs = dynamic(
  () => import("@/app/components/Dataset/LanguageGraph/LanguageGraph"),
);

import StatsTable from "@/app/components/Dataset/Stats/Stats";
import CopyBibtexButton from "./CopyBibtexButton";

import s from "./page.module.css";
import { callPythonReadData } from "@/lib/pythonClient";

export const dynamicParams = true;

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
                    <span
                      className={s.metaVal}
                      dangerouslySetInnerHTML={{ __html: license }}
                    />
                  </div>
                )}
              </div>
            )}

            {copyright && (
              <div className={s.block}>
                <h2 className={s.h2}>Copyright</h2>
                <div
                  className={s.content}
                  dangerouslySetInnerHTML={{ __html: copyright }}
                />
              </div>
            )}

            {(description || cite) && (
              <div className={s.block}>
                {description && (
                  <div
                    className={s.content}
                    dangerouslySetInnerHTML={{ __html: description }}
                  />
                )}
                {cite && (
                  <div
                    className={s.content}
                    dangerouslySetInnerHTML={{ __html: cite }}
                  />
                )}

                {bibtexText && (
                  <div className={s.actions}>
                    <CopyBibtexButton text={bibtexText} />
                  </div>
                )}
              </div>
            )}
          </section>
          {/* 3) STATS TABLE CARD */}
          {!statsEmpty && (
            <section className={s.card}>
              <StatsTable info={corpusInfo} />
            </section>
          )}

          {/* 2) LANGUAGE GRAPHS CARD */}
          {graphValues.length > 0 && (
            <section className={s.card}>
              <LanguageGraphs graphValues={graphValues} />
            </section>
          )}

          {/* 4) DOWNLOADS CARD */}
          {languages.length > 0 && (
            <section id="download" className={s.card}>
              <CorpusPageContainer languageList={languages} version={version} />
            </section>
          )}
          <CorpusDisclaimer />
        </main>
      </Suspense>
    );
  } catch (error) {
    notFound();
  }
}
