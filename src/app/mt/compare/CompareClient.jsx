"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import btns from "../../../styles/Buttons.module.css";
import s from "./page.module.css";

import SampleBlock from "@/app/components/MT/Compare/SampleBlock/SampleBlock";
import CompareNotFound from "@/app/components/MT/Compare/NotFound/NotFound";

const PAGE = 10;

function enc(v = "") {
  return encodeURIComponent(String(v));
}

function Controls({
  showDiff,
  setShowDiff,
  start,
  end,
  total,
  onStart,
  onPrev,
  onNext,
}) {
  return (
    <div className={s.ctrl}>
      <button
        type="button"
        className={showDiff ? s.tglOn : s.tgl}
        onClick={() => setShowDiff((x) => !x)}
      >
        Difference
      </button>

      <div className={s.pager}>
        {start > 0 && (
          <button type="button" className={s.btn} onClick={onStart}>
            Start
          </button>
        )}

        <span className={s.range}>
          Showing <b>{total ? start + 1 : 0}</b>–<b>{Math.min(end, total)}</b> /{" "}
          {total}
        </span>

        {start > 0 && (
          <button type="button" className={s.btn} onClick={onPrev}>
            Previous
          </button>
        )}

        {end < total && (
          <button type="button" className={s.btn} onClick={onNext}>
            Next
          </button>
        )}
      </div>
    </div>
  );
}

export default function CompareClient({
  dataset,
  languages,
  sourceData,
  targetData,
  modelType,
  modelOne,
  modelTwo,
  modelThree,
  modelOneUrl,
  modelTwoUrl,
  modelThreeUrl,
  modelOneData,
  modelTwoData,
  modelThreeData,
  allDiff,
  from,
  notFound = false,
}) {
  const [start, setStart] = useState(0);
  const [showDiff, setShowDiff] = useState(false);

  const total = sourceData?.length ?? 0;
  const end = start + PAGE;

  const srcLabel = languages?.[0]?.label ?? "";
  const trgLabel = languages?.[1]?.label ?? "";
  const srcCode = languages?.[0]?.value ?? "";
  const trgCode = languages?.[1]?.value ?? "";

  const page = useMemo(() => {
    const slice = Array.isArray(sourceData) ? sourceData.slice(start, end) : [];
    return slice.map((_, i) => start + i);
  }, [sourceData, start, end]);

  // New “back” links (query-based)
  const backHref =
    from === "models"
      ? `/compare-models?src=${enc(srcCode)}&trg=${enc(
          trgCode,
        )}&metric=bleu&m1=${enc(modelOne)}&m2=${enc(modelTwo)}`
      : `/mt?source=${enc(srcCode)}&target=${enc(trgCode)}&score=bleu&benchmark=all&model=${enc(
          modelType,
        )}`;

  if (notFound) {
    return (
      <CompareNotFound
        redirectPage={from === "models" ? "models" : "dashboard"}
        sourceCode={srcCode}
        targetCode={trgCode}
        dataset={dataset}
        sourceLang={srcLabel}
        targetLang={trgLabel}
        modelType={modelType}
        modelOne={modelOne}
        modelTwo={modelTwo}
        modelThree={modelThree}
        modelThreeData={modelThreeData}
        backHref={backHref}
      />
    );
  }

  return (
    <main className={s.wrap}>
      <header className={s.head}>
        <div className={s.top}>
          <h1 className={s.h1}>Benchmark Translations</h1>
          <Link className={btns.secondaryButton} href={backHref}>
            Back to search
          </Link>
        </div>

        <p className={s.meta}>
          <span className={s.metaKey}>Testset</span>
          <span className={s.metaVal}>{dataset}</span>
          <span className={s.dot} aria-hidden="true">
            ·
          </span>
          <span className={s.metaKey}>Pair</span>
          <span className={s.metaVal}>
            {srcLabel} – {trgLabel}
          </span>
        </p>

        <div className={s.models}>
          {modelType === "all" && (
            <>
              {modelOneUrl && (
                <Link
                  className={`${s.m} ${s.m1}`}
                  href={modelOneUrl}
                  target="_blank"
                >
                  Model 1: {modelOne}
                </Link>
              )}
              {modelTwoUrl && (
                <Link
                  className={`${s.m} ${s.m2}`}
                  href={modelTwoUrl}
                  target="_blank"
                >
                  Model 2: {modelTwo}
                </Link>
              )}
              {modelThreeData && modelThreeUrl && (
                <Link
                  className={`${s.m} ${s.m3}`}
                  href={modelThreeUrl}
                  target="_blank"
                >
                  Model 3: {modelThree}
                </Link>
              )}
            </>
          )}

          {modelType === "opus" && modelOneUrl && (
            <Link
              className={`${s.m} ${s.m1}`}
              href={modelOneUrl}
              target="_blank"
            >
              Model: {modelOne}
            </Link>
          )}

          {modelType === "external" && modelTwoUrl && (
            <Link
              className={`${s.m} ${s.m2}`}
              href={modelTwoUrl}
              target="_blank"
            >
              Model: {modelOne}
            </Link>
          )}

          {modelType === "contributed" && modelThreeUrl && (
            <Link
              className={`${s.m} ${s.m3}`}
              href={modelThreeUrl}
              target="_blank"
            >
              Model: {modelOne}
            </Link>
          )}
        </div>
      </header>

      <Controls
        showDiff={showDiff}
        setShowDiff={setShowDiff}
        start={start}
        end={end}
        total={total}
        onStart={() => setStart(0)}
        onPrev={() => setStart((n) => Math.max(0, n - PAGE))}
        onNext={() =>
          setStart((n) => Math.min(Math.max(0, total - PAGE), n + PAGE))
        }
      />

      <section className={s.list}>
        {page.map((absIdx) => (
          <SampleBlock
            key={`${dataset}-${absIdx}`}
            languages={languages}
            idx={absIdx - start}
            startNum={start}
            sourceData={sourceData}
            targetData={targetData}
            modelType={modelType}
            modelOneData={modelOneData}
            modelTwoData={modelTwoData}
            modelThreeData={modelThreeData}
            showDiff={showDiff}
            allDiff={allDiff}
          />
        ))}
      </section>

      <Controls
        showDiff={showDiff}
        setShowDiff={setShowDiff}
        start={start}
        end={end}
        total={total}
        onStart={() => {
          setStart(0);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        onPrev={() => {
          setStart((n) => Math.max(0, n - PAGE));
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        onNext={() => {
          setStart((n) => Math.min(Math.max(0, total - PAGE), n + PAGE));
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />
    </main>
  );
}
