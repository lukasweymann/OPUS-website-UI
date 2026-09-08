"use client";

import { useState, useEffect } from "react";
import {
  useRouter,
  useParams,
  usePathname,
  useSearchParams,
} from "next/navigation";
import { codeToLangTransformer, removeLanguage } from "../../../../hooks/hooks";
import MiniSelect from "./MiniSelect/MiniSelect";
import s from "./Search.module.css";

const DATASET_PAIR_PENDING_EVENT = "opus:dataset-pair-pending";

function normalizePair(a = "", b = "") {
  const src = String(a).replaceAll("=", "").trim();
  const trg = String(b).replaceAll("=", "").trim();
  return src && trg ? { src, trg } : null;
}

function parseQueryPair(searchString = "") {
  const i = searchString.indexOf("pair=");
  if (i < 0) return null;

  const raw = searchString.slice(i + "pair=".length);
  const [src, trg] = raw.split("&");
  return normalizePair(src, trg);
}

function parseRoutePair(langpair = "") {
  const decoded = decodeURIComponent(String(langpair));
  const separator = decoded.includes("&") ? "&" : "-";
  const [src, trg] = decoded.split(separator);
  return normalizePair(src, trg);
}

export default function Search({ mode, languageList, navbar, className = "" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { corpus } = useParams() || {};

  const params = useParams();
  const langpair = params?.langpair || "";
  const searchString = searchParams.toString();
  const initialPair =
    parseQueryPair(searchString) ||
    (pathname?.startsWith("/corpora-search/")
      ? parseRoutePair(langpair)
      : null);

  const [srcOpts, setSrcOpts] = useState([]);
  const [trgOpts, setTrgOpts] = useState([]);
  const [src, setSrc] = useState(initialPair?.src ?? "");
  const [trg, setTrg] = useState(initialPair?.trg ?? "");

  useEffect(() => {
    const nextPair =
      parseQueryPair(searchString) ||
      (pathname?.startsWith("/corpora-search/")
        ? parseRoutePair(langpair)
        : null);

    if (!nextPair) return;
    setSrc(nextPair.src);
    setTrg(nextPair.trg);
  }, [langpair, pathname, searchString]);

  async function fetchLangs(kind) {
    const response = await fetch(
      `/opusapi/?languages=True${corpus && !navbar ? `&corpus=${corpus}` : ""}${
        kind === "trg" && corpus && !navbar
          ? `&source=${src.replace("-", "_")}`
          : ""
      }`,
      {
        method: "GET",
      },
    );

    const body = await response.json();
    const raw = body?.languages || [];
    const clean = raw.filter(
      (code) => !/\d/.test(code) && !removeLanguage.includes(code),
    );
    const mapped = codeToLangTransformer(clean); // [{label,value}]

    if (kind === "src") {
      setSrcOpts(mapped);
    } else {
      setTrgOpts(mapped);
      if (!clean.includes(trg)) setTrg("");
    }
  }

  // Preload from prop if given
  useEffect(() => {
    if (languageList && languageList.length) {
      setSrcOpts(languageList);
      return;
    }
  }, [languageList]);

  useEffect(() => {
    if (!languageList) {
      fetchLangs("src");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (corpus) fetchLangs("src");
  }, [corpus]);

  useEffect(() => {
    if (src) fetchLangs("trg");
  }, [src]);

  function go() {
    if (!src || !trg) return;
    if (mode === "corpusPage") {
      const pair = `${src}&${trg}`;
      window.dispatchEvent(
        new CustomEvent(DATASET_PAIR_PENDING_EVENT, {
          detail: { corpus, pair },
        }),
      );
      router.push(`/datasets/${corpus}?pair=${pair}`, { scroll: false });
    } else {
      router.push(`/corpora-search/${src}&${trg}`);
    }
  }

  const disabled = !(src && trg);

  return (
    <div className={`${s.wrap} ${className}`}>
      <div className={s.field}>
        <MiniSelect
          options={srcOpts}
          value={src}
          onChange={(v) => setSrc(v)}
          placeholder="Select source"
          disabled={false}
        />
      </div>
      <div className={s.field}>
        <MiniSelect
          options={trgOpts}
          value={trg}
          onChange={(v) => setTrg(v)}
          placeholder={src ? "Select target" : "Pick source first"}
          disabled={!src}
        />
      </div>
      <button
        className={s.btn}
        onClick={go}
        disabled={disabled}
        autoComplete="off"
        title={disabled ? "Please select a language pair to search." : ""}
        aria-label="Search"
      >
        <svg
          className={s.icon}
          width="18"
          height="18"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M10 4a6 6 0 1 1 0 12A6 6 0 0 1 10 4zm0-2a8 8 0 1 0 4.9 14.3l4.4 4.4 1.4-1.4-4.4-4.4A8 8 0 0 0 10 2z" />
        </svg>
      </button>
    </div>
  );
}
