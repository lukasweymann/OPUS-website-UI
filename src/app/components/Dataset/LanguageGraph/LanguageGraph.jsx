"use client";

import { useCallback, useMemo, useRef, useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  BarChart,
  Bar,
  Brush,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import {
  codeToLangTransformer,
  DataFormatter,
} from "../../../../../hooks/hooks";
import LoaderSpinner from "../../ui/LoaderSpinner/LoaderSpinner";
import PairsGraph from "../PairsGraph/PairsGraph";
import s from "./LanguageGraph.module.css";

const nfCompact = new Intl.NumberFormat("en", { notation: "compact" });
const DEFAULT_BRUSH_END = 10;

function asString(v) {
  return Array.isArray(v) ? v[0] : v || "";
}

function defaultBrushRange(len) {
  const max = Math.max(0, len - 1);
  return {
    startIndex: 0,
    endIndex: Math.min(DEFAULT_BRUSH_END, max),
  };
}

function clampIndex(value, fallback, max) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, Math.min(Math.round(n), max));
}

function normalizeBrushRange(range, len, fallback = defaultBrushRange(len)) {
  const max = Math.max(0, len - 1);
  if (max <= 0) return { startIndex: 0, endIndex: 0 };

  const safeFallback = {
    startIndex: clampIndex(fallback?.startIndex, 0, max),
    endIndex: clampIndex(
      fallback?.endIndex,
      Math.min(DEFAULT_BRUSH_END, max),
      max,
    ),
  };

  let startIndex = clampIndex(range?.startIndex, safeFallback.startIndex, max);
  let endIndex = clampIndex(range?.endIndex, safeFallback.endIndex, max);

  if (endIndex < startIndex) {
    [startIndex, endIndex] = [endIndex, startIndex];
  }

  if (endIndex === startIndex && max > 0) {
    if (startIndex === max) startIndex -= 1;
    else endIndex += 1;
  }

  return { startIndex, endIndex };
}

function sameBrushRange(a, b) {
  return a?.startIndex === b?.startIndex && a?.endIndex === b?.endIndex;
}

function sameGraphValues(a, b) {
  if (a === b) return true;
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) {
    return false;
  }

  return a.every((row, index) => {
    const other = b[index];
    return (
      row?.name === other?.name &&
      row?.sentences === other?.sentences &&
      row?.perc === other?.perc
    );
  });
}

function useStableGraphValues(graphValues) {
  const rows = Array.isArray(graphValues) ? graphValues : [];
  const rowsRef = useRef(rows);

  if (!sameGraphValues(rowsRef.current, rows)) {
    rowsRef.current = rows;
  }

  return rowsRef.current;
}

function isFullRangeReset(next, previous, len) {
  const max = Math.max(0, len - 1);
  const previousSpan = (previous?.endIndex ?? 0) - (previous?.startIndex ?? 0);

  return (
    max > DEFAULT_BRUSH_END &&
    next.startIndex === 0 &&
    next.endIndex === max &&
    previousSpan < max
  );
}

function Tip({ title, rows }) {
  return (
    <div className={s.tip}>
      <div className={s.tipTitle}>{title}</div>
      <div className={s.tipRows}>
        {rows.map((r, i) => (
          <div key={`${r.label}-${i}`} className={s.tipRow}>
            <span className={s.tipKey}>{r.label}</span>
            <span className={s.tipVal}>{r.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LangTooltip({ active, payload, label }) {
  if (!active || !payload?.length || !label) return null;

  const langName = codeToLangTransformer([label])?.[0]?.label ?? label;
  const sent = payload?.[0]?.value ?? 0;

  return (
    <Tip
      title={langName}
      rows={[
        { label: "Sentences", value: nfCompact.format(Number(sent || 0)) },
      ]}
    />
  );
}

export default function LanguageGraphs({ graphValues = [] }) {
  const router = useRouter();
  const params = useParams();

  const corpus = useMemo(() => asString(params?.corpus), [params]);
  const chartValues = useStableGraphValues(graphValues);

  const [status, setStatus] = useState("idle");
  const [currentLang, setCurrentLang] = useState("");
  const [pairs, setPairs] = useState([]);

  const hasData = chartValues.length > 0;

  const len = chartValues.length;
  const showBrush = len > 1;

  const lastGoodRef = useRef(defaultBrushRange(len));
  const brushGestureRef = useRef(false);
  const brushGestureTimerRef = useRef(null);
  const brushRef = useRef(defaultBrushRange(len));

  const [brush, setBrush] = useState(() => defaultBrushRange(len));
  const [brushRevision, setBrushRevision] = useState(0);

  useEffect(() => {
    setBrush((prev) => {
      const next = normalizeBrushRange(prev, len, lastGoodRef.current);
      lastGoodRef.current = next;
      brushRef.current = next;
      return sameBrushRange(prev, next) ? prev : next;
    });
  }, [len]);

  useEffect(() => {
    return () => {
      if (brushGestureTimerRef.current) {
        clearTimeout(brushGestureTimerRef.current);
      }
    };
  }, []);

  const brushKey = useMemo(
    () => `${corpus}::${len}::${brushRevision}`,
    [corpus, len, brushRevision],
  );

  const endBrushGesture = useCallback(() => {
    if (brushGestureTimerRef.current) {
      clearTimeout(brushGestureTimerRef.current);
    }

    brushGestureTimerRef.current = window.setTimeout(() => {
      brushGestureRef.current = false;
    }, 250);
  }, []);

  const onChartPointerDown = useCallback((event) => {
    if (event.target?.closest?.(".recharts-brush")) {
      brushGestureRef.current = true;

      if (brushGestureTimerRef.current) {
        clearTimeout(brushGestureTimerRef.current);
      }

      brushGestureTimerRef.current = window.setTimeout(() => {
        brushGestureRef.current = false;
      }, 3000);
    }
  }, []);

  const onBrushChange = useCallback(
    (range) => {
      if (!range || len <= 1) return;

      const fallback = normalizeBrushRange(
        brushRef.current,
        len,
        lastGoodRef.current,
      );
      const next = normalizeBrushRange(range, len, fallback);

      if (
        !brushGestureRef.current &&
        isFullRangeReset(next, fallback, len)
      ) {
        lastGoodRef.current = fallback;
        brushRef.current = fallback;
        setBrush(fallback);
        setBrushRevision((revision) => revision + 1);
        return;
      }

      lastGoodRef.current = next;
      brushRef.current = next;
      setBrush((prev) => (sameBrushRange(prev, next) ? prev : next));
    },
    [len],
  );

  const fetchPairs = useCallback(
    async (source) => {
      if (!corpus || !source) return;

      setStatus("loading");
      try {
        const url = `/opusapi/?corpus=${encodeURIComponent(
          corpus,
        )}&source=${encodeURIComponent(
          source,
        )}&preprocessing=xml&version=latest`;

        const res = await fetch(url, { method: "GET" });
        if (!res.ok) throw new Error(`opusapi failed: ${res.status}`);

        const json = await res.json();
        const raw = Array.isArray(json?.corpora) ? json.corpora : [];
        const clean = raw.filter((x) => x?.source && x?.target);

        setPairs(clean);
        setStatus(clean.length ? "ready" : "error");
      } catch {
        setPairs([]);
        setStatus("error");
      }
    },
    [corpus],
  );

  const onLangBarClick = useCallback(
    (bar) => {
      const lang = bar?.payload?.name;
      if (!lang) return;
      setCurrentLang(lang);
      fetchPairs(lang);
    },
    [fetchPairs],
  );

  const onPickPair = useCallback(
    (p) => {
      if (!p?.source || !p?.target || !corpus) return;
      const pair = `${p.source}&${p.target}`.replaceAll("-", "_");
      router.push(`/datasets/${corpus}?pair=${pair}`, { scroll: false });
    },
    [router, corpus],
  );

  const currentLangLabel =
    codeToLangTransformer([currentLang])?.[0]?.label ?? currentLang;

  const containerClass = status === "ready" ? s.shellDouble : s.shellSingle;

  return (
    <>
      {hasData && (
        <section className={containerClass}>
          <header className={s.head}>
            <h2 className={s.h2}>Languages in the {corpus} dataset</h2>
            <p className={s.p}>
              Click a language bar to see which pairs are available.
            </p>
          </header>

          <div
            className={s.chart}
            onPointerDownCapture={onChartPointerDown}
            onPointerUpCapture={endBrushGesture}
            onPointerCancelCapture={endBrushGesture}
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={chartValues}
                margin={{ top: 8, right: 10, left: 0, bottom: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={12} tickMargin={8} />
                <YAxis tickFormatter={DataFormatter} fontSize={12} />
                <Tooltip
                  content={<LangTooltip />}
                  wrapperStyle={{ outline: "none" }}
                />

                {showBrush && (
                  <Brush
                    key={brushKey}
                    dataKey="name"
                    height={18}
                    startIndex={brush.startIndex}
                    endIndex={brush.endIndex}
                    data={chartValues}
                    onChange={onBrushChange}
                  />
                )}

                <Bar
                  dataKey="sentences"
                  fill="#6D5BFF"
                  activeBar={{ fill: "#B9B1FF" }}
                  onClick={onLangBarClick}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className={s.subhead}>
            {status === "idle" && (
              <div className={s.hint}>
                Tip: you can scroll the brush to browse long lists.
              </div>
            )}

            {status === "loading" && (
              <div className={s.loading}>
                <LoaderSpinner size={16} decorative />
                <span>Loading pairs for {currentLangLabel || "…"}</span>
              </div>
            )}

            {status === "error" && currentLang && (
              <div className={s.empty}>
                No stats found for this language. You can still try downloads
                below.
              </div>
            )}

            {status === "ready" && currentLang && (
              <>
                <h3 className={s.h3}>
                  Language pairs containing {currentLangLabel}
                </h3>
                <p className={s.p}>
                  Click a pair bar to jump to downloads for that pair.
                </p>
              </>
            )}
          </div>

          <PairsGraph
            pairs={pairs}
            status={status}
            currentLang={currentLang}
            currentLangLabel={currentLangLabel}
            onPickPair={onPickPair}
          />
        </section>
      )}
    </>
  );
}
