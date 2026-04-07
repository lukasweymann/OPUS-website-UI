"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
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
import s from "./LanguageGraph.module.css";

const nfCompact = new Intl.NumberFormat("en", { notation: "compact" });

const asString = (v) => (Array.isArray(v) ? v[0] : v || "");

function PairTooltip({ active, payload, label }) {
  if (!active || !payload?.length || !label) return null;

  const p = payload[0]?.payload || {};
  const clean = String(p.lang_pair || label).replaceAll(" ", "");
  const parts = clean.split("-");
  const names = parts.length >= 2 ? codeToLangTransformer(parts) : null;
  const title =
    names?.length === 2 ? `${names[0].label} - ${names[1].label}` : clean;

  return (
    <div className={s.tip}>
      <div className={s.tipTitle}>{title}</div>

      <div className={s.tipRow}>
        <span className={s.k}>Sentences</span>
        <span className={s.v}>
          {nfCompact.format(Number(p.alignments ?? 0))}
        </span>
      </div>

      <div className={s.tipRow}>
        <span className={s.k}>{p.src_lang || "src"} tokens</span>
        <span className={s.v}>
          {nfCompact.format(Number(p.src_tokens ?? 0))}
        </span>
      </div>

      <div className={s.tipRow}>
        <span className={s.k}>{p.tgt_lang || "trg"} tokens</span>
        <span className={s.v}>
          {nfCompact.format(Number(p.tgt_tokens ?? 0))}
        </span>
      </div>
    </div>
  );
}

export default function LanguageGraphsSynthetic({ graphValues }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const params = useParams();

  const corpus = useMemo(() => asString(params?.corpus), [params]);
  const version = useMemo(() => asString(params?.version), [params]);

  const isLoading = graphValues === "LOADING";
  const isError = graphValues === 404;

  const rows = useMemo(() => {
    if (!Array.isArray(graphValues)) return [];
    return graphValues.map((r) => ({
      ...r,
      pairLabel: String(r?.lang_pair ?? ""),
    }));
  }, [graphValues]);

  const len = rows.length;
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
      const e = Math.max(
        1,
        Math.min(prev?.endIndex ?? lastGoodRef.current.endIndex, max),
      );
      const next = { startIndex: s, endIndex: e };
      lastGoodRef.current = next;
      return next;
    });
  }, [len]);

  const brushKey = useMemo(
    () => `${pathname}::${sp?.toString() ?? ""}`,
    [pathname, sp],
  );

  const setPair = useCallback(
    (pair) => {
      const next = new URLSearchParams(sp?.toString() || "");
      if (pair) next.set("pair", pair);
      else next.delete("pair");
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname, sp],
  );

  const onBarClick = useCallback(
    (node) => {
      const p = node?.activePayload?.[0]?.payload;
      const pair = p?.lang_pair;
      if (!pair) return;
      setPair(String(pair));
    },
    [setPair],
  );

  if (isError) {
    return (
      <div className={s.wrap}>
        <h2 className={s.h2}>
          Language pairs in {corpus} – {version}
        </h2>
        <p className={s.p}>No stats found for this dataset.</p>
      </div>
    );
  }

  if (!rows.length) {
    return (
      <div className={s.wrap}>
        <h2 className={s.h2}>
          Language pairs in {corpus} – {version}
        </h2>
        <p className={s.p}>{isLoading ? "Loading…" : "No data available."}</p>
      </div>
    );
  }

  return (
    <section className={s.wrap} aria-label="Synthetic language pairs graph">
      <header className={s.head}>
        <h2 className={s.h2}>
          Language pairs in {corpus} – {version}
        </h2>
        <p className={s.p}>Click a bar to select a pair below.</p>
      </header>

      <div className={s.chart}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={rows}
            margin={{ top: 8, right: 10, left: 0, bottom: 8 }}
            onClick={onBarClick}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="pairLabel" fontSize={12} tickMargin={8} />
            <YAxis tickFormatter={DataFormatter} fontSize={12} />
            <Tooltip
              content={<PairTooltip />}
              wrapperStyle={{ outline: "none" }}
            />

            {showBrush && (
              <Brush
                key={brushKey}
                data={rows}
                dataKey="pairLabel"
                height={18}
                startIndex={brush.startIndex}
                endIndex={brush.endIndex}
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

            <Bar dataKey="alignments" fill="#2CB9B1" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
