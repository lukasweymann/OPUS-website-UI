"use client";

import { useCallback, useMemo, useRef } from "react";
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
import s from "../LanguageGraph/LanguageGraph.module.css";

const nfCompact = new Intl.NumberFormat("en", { notation: "compact" });
const GRAPH_LOADER_SIZE = 26;

function isBrushEvent(event) {
  return Boolean(event?.target?.closest?.(".recharts-brush"));
}

function payloadFromLabel(rows, label, dataKey) {
  if (label == null) return null;
  return rows.find((row) => String(row?.[dataKey]) === String(label)) ?? null;
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

function PairTooltip({ active, payload, label }) {
  if (!active || !payload?.length || !label) return null;

  const p = payload[0]?.payload || {};
  const src = p.source || "";
  const trg = p.target || "";
  const langName = codeToLangTransformer([src, trg]);
  const title =
    langName?.length === 2
      ? `${langName[0].label} - ${langName[1].label}`
      : label;

  return (
    <Tip
      title={title}
      rows={[
        {
          label: "Sentences",
          value: nfCompact.format(Number(p.alignment_pairs || 0)),
        },
        {
          label: `${src} tokens`,
          value: nfCompact.format(Number(p.source_tokens || 0)),
        },
        {
          label: `${trg} tokens`,
          value: nfCompact.format(Number(p.target_tokens || 0)),
        },
      ]}
    />
  );
}

function withLabel(pairs) {
  // ensure XAxis/Brush dataKey is a stable string field
  return (pairs || []).map((x) => ({
    ...x,
    pairLabel: x.pairLabel || `${x.source} - ${x.target}`,
  }));
}

function defaultEnd(len, win = 10) {
  const max = Math.max(0, len - 1);
  return Math.min(max, win);
}

export default function PairsGraph({
  pairs = [],
  currentLang = "",
  currentLangLabel = "",
  status = "idle", // idle | loading | ready | error
  onPickPair, // (payload) => void
  pairLoading = false,
  loadingPairLabel = "",
  windowSize = 10,
}) {
  const data = useMemo(() => withLabel(pairs), [pairs]);
  const activePairRef = useRef(null);
  const directBarClickRef = useRef(0);

  const chartKey = useMemo(
    () => `pairs__${currentLang || "none"}__${data.length}`,
    [currentLang, data.length],
  );

  const endIndex = useMemo(
    () => defaultEnd(data.length, windowSize),
    [data.length, windowSize],
  );

  const onChartClick = useCallback(
    (chartState, event) => {
      if (isBrushEvent(event)) return;
      if (Date.now() - directBarClickRef.current < 100) return;

      const payload =
        payloadFromLabel(data, chartState?.activeLabel, "pairLabel") ??
        activePairRef.current;
      if (payload) onPickPair?.(payload);
    },
    [data, onPickPair],
  );

  const onChartMouseMove = useCallback(
    (chartState) => {
      activePairRef.current = chartState?.isTooltipActive
        ? payloadFromLabel(data, chartState.activeLabel, "pairLabel")
        : null;
    },
    [data],
  );

  const onChartMouseLeave = useCallback(() => {
    activePairRef.current = null;
  }, []);

  const onBarDirectClick = useCallback(
    (bar) => {
      directBarClickRef.current = Date.now();
      onPickPair?.(bar?.payload);
    },
    [onPickPair],
  );

  if (status !== "ready" || data.length === 0) return null;

  return (
    <div className={`${s.chart2} ${s.clickableChart}`}>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          key={chartKey}
          data={data}
          margin={{ top: 8, right: 10, left: 0, bottom: 8 }}
          onClick={onChartClick}
          onMouseMove={onChartMouseMove}
          onMouseLeave={onChartMouseLeave}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="pairLabel" fontSize={12} tickMargin={8} />
          <YAxis tickFormatter={DataFormatter} fontSize={12} />
          <Tooltip
            content={<PairTooltip />}
            wrapperStyle={{ outline: "none" }}
          />

          <Brush
            key={`${chartKey}__brush`}
            dataKey="pairLabel"
            height={18}
            startIndex={0}
            endIndex={endIndex}
          />

          <Bar
            dataKey="alignment_pairs"
            fill="#2CB9B1"
            activeBar={{ fill: "#86E3DA" }}
            cursor="pointer"
            onClick={onBarDirectClick}
          />
        </BarChart>
      </ResponsiveContainer>

      <div className={s.hintRow}>
        {pairLoading ? (
          <span className={s.loading}>
            <LoaderSpinner size={GRAPH_LOADER_SIZE} decorative />
            <span>Loading downloads for {loadingPairLabel || "pair"}…</span>
          </span>
        ) : (
          <span className={s.hintTiny}>
            Showing pairs for{" "}
            <strong>{currentLangLabel || currentLang || "…"}</strong>
          </span>
        )}
      </div>
    </div>
  );
}
