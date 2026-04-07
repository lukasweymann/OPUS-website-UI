"use client";

import { useMemo, useState } from "react";
import { CopyIcon } from "lucide-react";
import {
  sampleSentenceCleaner,
  rtlLanguages,
} from "../../../../../hooks/hooks";
import s from "./SampleBox.module.css";

function splitPair(pair = "") {
  const decoded = decodeURIComponent(String(pair));

  const parts = decoded.includes("%26")
    ? decoded.split("%26")
    : decoded.includes("&")
      ? decoded.split("&")
      : decoded.split("%2526"); // defensive

  const [a = "", b = ""] = parts;
  return [a, b];
}

function isRTL(code = "") {
  const base = String(code).replace("_", "-").split("-")[0];
  return rtlLanguages.includes(base);
}

function IconCopyButton({ text, label = "Copy sentence" }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 900);
    } catch {
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 900);
      } catch {
        // ignore
      }
    }
  }

  return (
    <button
      type="button"
      className={s.copy}
      onClick={copy}
      aria-label={label}
      title={copied ? "Copied!" : "Copy"}
      data-copied={copied ? "1" : "0"}
    >
      <CopyIcon size={16} />
    </button>
  );
}

export default function SampleBox({
  languagePair = "",
  sentence = "",
  secondModality = false,
  backwardsLanguageId = false,
  horizontal = true,
}) {
  const [pairA, pairB] = useMemo(() => splitPair(languagePair), [languagePair]);

  const originLang = backwardsLanguageId ? pairB : pairA;
  const targetLang = backwardsLanguageId ? pairA : pairB;

  const originLabel = originLang.replaceAll("_", "-");
  const targetLabel = targetLang.replaceAll("_", "-");

  const parsed = useMemo(() => {
    const lines = String(sentence)
      .split("<br>")
      .map((x) => x.trim())
      .filter(Boolean);

    const src = [];
    const trg = [];

    for (const item of lines) {
      if (item.includes("src")) src.push(sampleSentenceCleaner(item));
      else if (item.includes("trg")) trg.push(sampleSentenceCleaner(item));
    }

    const fallback0 = sampleSentenceCleaner(lines[0] ?? "");
    const fallback1 = sampleSentenceCleaner(lines[1] ?? "");

    return {
      src: src.length ? src : fallback0 ? [fallback0] : [],
      trg: trg.length ? trg : fallback1 ? [fallback1] : [],
    };
  }, [sentence]);

  const layoutClass = horizontal ? s.boxRow : s.boxCol;

  return (
    <article className={layoutClass}>
      <section className={s.side}>
        <div className={s.lang} aria-label="Source language">
          {originLabel}
        </div>

        <div className={s.lines}>
          {(secondModality ? parsed.src.slice(0, 1) : parsed.src).map(
            (txt, i) => (
              <div key={`src-${i}-${txt.slice(0, 18)}`} className={s.line}>
                <p className={`${s.txt} ${isRTL(originLang) ? s.rtl : ""}`}>
                  {txt}
                </p>
                <IconCopyButton text={txt} label="Copy source sentence" />
              </div>
            ),
          )}
        </div>
      </section>

      <div className={s.div} aria-hidden="true" />

      <section className={s.side}>
        <div className={s.lang} aria-label="Target language">
          {targetLabel}
        </div>

        <div className={s.lines}>
          {(secondModality ? parsed.trg.slice(0, 1) : parsed.trg).map(
            (txt, i) => (
              <div key={`trg-${i}-${txt.slice(0, 18)}`} className={s.line}>
                <p className={`${s.txt} ${isRTL(targetLang) ? s.rtl : ""}`}>
                  {txt}
                </p>
                <IconCopyButton text={txt} label="Copy target sentence" />
              </div>
            ),
          )}
        </div>
      </section>
    </article>
  );
}
