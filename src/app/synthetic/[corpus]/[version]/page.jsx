import Link from "next/link";
import { notFound } from "next/navigation";
import yaml from "js-yaml";

import { callLangpairsService } from "@/lib/langpairsServiceClient";
import { languagePairName } from "../../../../../hooks/hooks";

import CorpusDisclaimer from "@/app/components/Dataset/Disclaimer/Disclaimer";
import StatsTable from "@/app/components/Dataset/Stats/Stats";
import SyntheticTable from "@/app/components/Synthetic/ResultTable/ResultTable";

import PairPicker from "./PairPicker";
import CopyTextButton from "./CopyTextButton";
import SafeRichText from "@/app/components/ui/SafeRichText/SafeRichText";
import SyntheticExplorerTabs from "./SyntheticExplorerTabs";

import s from "./page.module.css";

export const revalidate = 900;

const MATRIX_PAIR_MIN = 4;
const MATRIX_LANGUAGE_LIMIT = 250;
const MATRIX_PAIR_LIMIT = 7500;

async function fetchYaml(url) {
  const res = await fetch(url, { next: { revalidate } });
  if (!res.ok) return null;
  const text = await res.text();
  return yaml.load(text);
}

function safeStr(x) {
  return typeof x === "string" ? x : "";
}

function decodeBibtexBase64(b64) {
  try {
    return Buffer.from(String(b64), "base64").toString("utf8");
  } catch {
    return "";
  }
}

function countLanguages(rows = []) {
  const languages = new Set();
  for (const row of rows) {
    if (row?.src_lang) languages.add(String(row.src_lang));
    if (row?.tgt_lang) languages.add(String(row.tgt_lang));
  }
  return languages.size;
}

export async function generateStaticParams() {
  const collections = await callLangpairsService({ mode: "collections" });
  const list = Array.isArray(collections?.collections)
    ? collections.collections
    : [];

  // Fixes the old `legnth` bug while preserving intended behavior
  const params = [];
  for (const c of list) {
    const name = String(c?.name ?? "");
    const versions = Array.isArray(c?.versions) ? c.versions : [];
    for (const v of versions) {
      params.push({ corpus: name, version: String(v) });
    }
  }
  return params;
}

export default async function SyntheticCorpusPage({ params, searchParams }) {
  const paramsReady = await params;
  const corpus = safeStr(paramsReady?.corpus);
  const version = safeStr(paramsReady?.version);
  if (!corpus || !version) notFound();

  const base = process.env.BASE;
  if (!base) notFound();

  const search = await searchParams;

  const pair = safeStr(search?.pair);

  const [graphValues, corpusInfo] = await Promise.all([
    callLangpairsService({ mode: "items", name: corpus, version }),
    fetchYaml(`${base}/synOPUS/refs/heads/main/corpus/${corpus}/info.yaml`),
  ]);

  const items = Array.isArray(graphValues?.items) ? graphValues.items : [];
  if (!items.length || !corpusInfo) notFound();

  const graphValuesWithName = items.map((val) => {
    const lp = String(val?.lang_pair ?? "");
    const parts = lp.split("-");
    const pretty = parts.length >= 2 ? languagePairName(parts) : null;
    const langPairNameStr =
      pretty?.length === 2 ? `${pretty[0].label} - ${pretty[1].label}` : lp;
    return { ...val, langPairName: langPairNameStr };
  });

  const chosenLangPair = pair
    ? (graphValuesWithName.find((el) => el?.lang_pair === pair) ?? null)
    : null;

  const name = safeStr(corpusInfo?.name);
  const license = safeStr(corpusInfo?.license);
  const latest_release = safeStr(corpusInfo?.latest_release);
  const copyright = safeStr(corpusInfo?.copyright);
  const description = safeStr(corpusInfo?.description);
  const cite = safeStr(corpusInfo?.cite);
  const bibtexText = corpusInfo?.bibtex
    ? decodeBibtexBase64(corpusInfo.bibtex)
    : "";

  const pairOptions = graphValuesWithName.map((x) => ({
    value: x.lang_pair,
    label: x.langPairName,
  }));
  const languageCount = countLanguages(graphValuesWithName);
  const shouldShowMatrix =
    graphValuesWithName.length >= MATRIX_PAIR_MIN &&
    graphValuesWithName.length <= MATRIX_PAIR_LIMIT &&
    languageCount <= MATRIX_LANGUAGE_LIMIT;
  const matrixRows = shouldShowMatrix ? graphValuesWithName : [];

  return (
    <main className={s.wrap}>
      <div className={s.top}>
        <a className={s.dl} href="#download">
          Download
        </a>
      </div>

      <section className={s.card}>
        <h1 className={s.title}>
          {name || corpus}
          <span className={s.ver}>{version}</span>
          <span className={s.tag}>Synthetic</span>
        </h1>

        {(latest_release || license) && (
          <div className={s.metaRow}>
            {latest_release && (
              <div className={s.meta}>
                <span className={s.metaKey}>Latest release</span>
                <Link
                  className={s.metaVal}
                  href={`/synthetic?corpus=${encodeURIComponent(corpus)}`}
                >
                  {latest_release}
                </Link>
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
          <>
            <h2 className={s.h2}>Copyright</h2>
            <SafeRichText className={s.content} html={copyright} />
          </>
        )}

        {(description || cite) && (
          <div className={s.contentBlock}>
            {description && (
              <SafeRichText className={s.content} html={description} />
            )}
            {cite && (
              <SafeRichText className={s.content} html={cite} />
            )}
          </div>
        )}

        {bibtexText && (
          <div className={s.actions}>
            <CopyTextButton text={bibtexText} label="Copy BibTeX" />
          </div>
        )}
      </section>

      <section className={s.card}>
        <StatsTable info={corpusInfo} />
      </section>

      <section className={s.card}>
        <div className={s.graphs}>
          <SyntheticExplorerTabs
            graphValues={graphValuesWithName}
            matrixRows={matrixRows}
            title="Explore language pairs"
          />
        </div>
      </section>

      <section id="download" className={s.card}>
        <div className={s.controls}>
          <h2 className={s.h2}>Downloads</h2>
          <p className={s.p}>
            Pick a language pair to see available downloads.
          </p>

          <PairPicker
            options={pairOptions}
            value={pair}
            corpus={corpus}
            version={version}
          />
        </div>
        {chosenLangPair && (
          <div className={s.results}>
            <SyntheticTable data={chosenLangPair} langPair={pair} />
          </div>
        )}
      </section>

      <CorpusDisclaimer />
    </main>
  );
}
