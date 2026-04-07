"use client";

import { useCallback, useMemo, useRef, useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
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
import PairsGraph from "../PairsGraph/PairsGraph";
import s from "./LanguageGraph.module.css";

const nfCompact = new Intl.NumberFormat("en", { notation: "compact" });

function asString(v) {
  return Array.isArray(v) ? v[0] : v || "";
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
  const searchParams = useSearchParams();

  const corpus = useMemo(() => asString(params?.corpus), [params]);

  const [status, setStatus] = useState("idle");
  const [currentLang, setCurrentLang] = useState("");
  const [pairs, setPairs] = useState([]);

  const hasData = Array.isArray(graphValues) && graphValues.length > 0;

  const len = graphValues?.length ?? 0;
  const showBrush = len > 1;

  const lastGoodRef = useRef({
    startIndex: 0,
    endIndex: Math.min(10, Math.max(1, len - 1)),
  });

  const [brush, setBrush] = useState(() => {
    if (len <= 1) return { startIndex: 0, endIndex: 1 };
    return { startIndex: 0, endIndex: Math.min(10, len - 1) };
  });

  useEffect(() => {
    if (len <= 1) return;
    setBrush((prev) => {
      const max = len - 1;
      const s = Math.max(
        0,
        Math.min(prev?.startIndex ?? lastGoodRef.current.startIndex, max),
      );
      const desiredEnd = prev?.endIndex ?? lastGoodRef.current.endIndex;
      const e = Math.max(1, Math.min(desiredEnd, max));
      const next = { startIndex: s, endIndex: e };
      lastGoodRef.current = next;
      return next;
    });
  }, [len]);

  const brushKey = useMemo(() => {
    return `${corpus}::${searchParams?.toString() ?? ""}`;
  }, [corpus, searchParams]);

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

          <div className={s.chart}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={graphValues}
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
                    height={18}
                    startIndex={brush.startIndex}
                    endIndex={brush.endIndex}
                    data={graphValues}
                    onChange={(r) => {
                      if (!r || len <= 1) return;
                      const max = len - 1;
                      const s = Math.max(0, Math.min(r.startIndex ?? 0, max));
                      const e = Math.max(1, Math.min(r.endIndex ?? max, max));
                      const next = { startIndex: s, endIndex: e };
                      lastGoodRef.current = next;
                      setBrush(next);
                    }}
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
                <span className={s.spinner} aria-hidden="true" />
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
