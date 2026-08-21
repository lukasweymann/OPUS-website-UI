"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import SampleBox from "@/app/components/Dataset/SampleBox/SampleBox";
import SelectMenu from "@/app/components/ui/SelectMenu/SelectMenu";
import btns from "@/styles/Buttons.module.css";

import {
  languagePairName,
  downloadSentencesAsTSV,
} from "../../../../../../../hooks/hooks";

import s from "./page.module.css";

function splitLangpair(langpair = "") {
  let raw = String(langpair);
  try {
    raw = decodeURIComponent(raw);
  } catch {
    // Keep the original value if it is not a valid encoded component.
  }

  return raw.includes("&") ? raw.split("&") : raw.split("-");
}

export default function SampleClient({
  corpus,
  version,
  langpair,
  sampleData = [],
  secondModality = false,
  mode,
  backwardsLanguageId = false,
}) {
  const [horizontal, setHorizontal] = useState(false);

  const [pageSize, setPageSize] = useState(10);
  const [start, setStart] = useState(0);

  const total = sampleData.length;
  const end = Math.min(start + pageSize, total);
  const page = useMemo(
    () => sampleData.slice(start, end),
    [sampleData, start, end],
  );

  useEffect(() => {
    setStart(0);
  }, [pageSize]);

  const canPrev = start > 0;
  const canNext = start + pageSize < total;

  function prev() {
    setStart((n) => Math.max(0, n - pageSize));
  }

  function next() {
    setStart((n) => Math.min(Math.max(0, total - 1), n + pageSize));
  }

  const pairPretty = useMemo(() => {
    if (!langpair) return null;
    return languagePairName(splitLangpair(langpair));
  }, [langpair]);

  const tsvFileName = `${corpus}-${version}-${langpair}`;
  const backHref =
    mode === "synth"
      ? `/synthetic/${corpus}/${version}`
      : `/datasets/${corpus}?pair=${String(langpair).replaceAll("-", "_")}`;

  return (
    <main className={s.wrap}>
      <section className={s.card}>
        {pairPretty && (
          <>
            <header className={s.head}>
              <h1 className={s.title}>
                Sample for {pairPretty[0].label} – {pairPretty[1].label} in{" "}
                <Link href={backHref} className={s.corpusLink}>
                  {corpus}
                </Link>{" "}
                <span className={s.ver}>v{version}</span>
              </h1>

              <div className={s.actions}>
                <button
                  type="button"
                  className={btns.secondaryButton}
                  onClick={() =>
                    downloadSentencesAsTSV(
                      sampleData,
                      tsvFileName,
                      secondModality,
                    )
                  }
                >
                  Download sample
                </button>
              </div>
            </header>
          </>
        )}

        <p className={s.sub}>
          This sample shows <span className={s.strong}>{total}</span> sentences.
        </p>

        <div className={s.toolbar}>
          <button
            type="button"
            className={btns.secondaryButton}
            onClick={() => setHorizontal((v) => !v)}
          >
            {horizontal ? "Display as Columns" : "Display as Rows"}
          </button>

          <Link href={backHref} className={btns.secondaryButton}>
            Back to corpus
          </Link>
        </div>

        {total > 5 && (
          <div className={s.controls}>
            <div className={s.rows}>
              <span className={s.meta}>Sentences</span>
              <SelectMenu
                ariaLabel="Sentences per page"
                value={pageSize}
                onChange={(v) => setPageSize(Number(v))}
                options={[
                  { value: 5, label: "5 / page" },
                  { value: 10, label: "10 / page" },
                  { value: 15, label: "15 / page" },
                  { value: 20, label: "20 / page" },
                ]}
                width={120}
              />
            </div>

            <div className={s.pager}>
              {canPrev && (
                <button
                  type="button"
                  onClick={prev}
                  className={btns.primaryButton}
                >
                  Prev
                </button>
              )}
              {canNext && (
                <button
                  type="button"
                  onClick={next}
                  className={btns.primaryButton}
                >
                  Next
                </button>
              )}

              <span className={s.meta}>
                {total === 0 ? "0" : `${start + 1}–${end}`} / {total}
              </span>
            </div>
          </div>
        )}
      </section>

      <section className={s.list}>
        {page.map((sentence, i) => (
          <SampleBox
            key={`${start + i}-${String(sentence).slice(0, 24)}`}
            languagePair={langpair}
            sentence={sentence}
            secondModality={secondModality}
            backwardsLanguageId={backwardsLanguageId}
            horizontal={horizontal}
          />
        ))}
      </section>
    </main>
  );
}
