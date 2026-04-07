"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Label,
} from "recharts";

import s from "./DiffGraph.module.css";

function fmtDiff(a, b, metric) {
  const na = Number(a);
  const nb = Number(b);
  if (!Number.isFinite(na) || !Number.isFinite(nb)) return null;
  const digits = metric === "bleu" || metric === "spbleu" ? 1 : 3;
  return Number((na - nb).toFixed(digits));
}

function TooltipCard({ active, payload, label, metric, benchmark }) {
  if (!active || !payload?.length) return null;

  // In this chart we have one Bar, but payload can still be an array.
  const row = payload[0]?.payload;

  return (
    <div className={s.tip}>
      <div className={s.tipHead}>
        <span className={s.tipTitle}>{label ?? "—"}</span>
        {benchmark === "all" && row?.testset ? (
          <span className={s.badge}>{row.testset}</span>
        ) : null}
      </div>

      <div className={s.tipRows}>
        {payload.map((p) => {
          const key = `${p.dataKey ?? "val"}::${row?.id ?? ""}`;
          return (
            <div key={key} className={s.tipRow}>
              <span className={s.k}>{metric.toUpperCase()} diff</span>
              <span className={s.v} style={{ color: p.fill }}>
                {Number.isFinite(p.value) ? p.value : "—"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function DiffGraph({
  values,
  score = "bleu",
  modelType,
  benchmark,
}) {
  const data = useMemo(() => {
    const rows = Array.isArray(values) ? values : [];
    const out = [];

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      if (!r?.external) continue;

      const diff = fmtDiff(r.score, r.external.score, score);
      if (diff == null) continue;

      // Keep whatever you were feeding as the X label.
      // If you want benchmark names here later, we can change labelKey safely.
      const name = String(r.idx ?? i);

      out.push({
        id: `${r.testset ?? "t"}::${r.model ?? "m"}::${
          r.external?.model ?? "e"
        }::${i}`,
        name,
        testset: r.testset,
        diff,
      });
    }

    return out;
  }, [values, score]);

  if (!data.length) return null;

  return (
    <section className={s.wrap} aria-label="Score difference chart">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          stackOffset="sign"
          margin={{ top: 22, right: 6, left: 15, bottom: 22 }}
        >
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis
            dataKey="name"
            fontSize={12}
            tickMargin={5}
            interval="preserveStartEnd"
          >
            <Label
              position="bottom"
              value="Benchmark (see table)"
              fontSize={13}
            />
          </XAxis>

          <YAxis
            type="number"
            fontSize={12}
            label={{
              value: `${score.toUpperCase()} DIFF`,
              angle: 0,
              position: "top",
              offset: 12,
              fontSize: 12,
            }}
          />

          <ReferenceLine y={0} />

          <Tooltip
            wrapperStyle={{ outline: "none" }}
            content={<TooltipCard metric={score} benchmark={benchmark} />}
          />

          <Bar dataKey="diff" fill="#5580E4" />
        </BarChart>
      </ResponsiveContainer>
    </section>
  );
}
