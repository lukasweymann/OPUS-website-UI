// components/NewDiffGraph/NewDiffGraph.jsx
"use client";

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

import s from "./CompareDiffGraph.module.css";

function Tip({ active, payload, label, scoreType }) {
  if (!active || !payload?.length) return null;

  const bench = payload?.[0]?.payload?.benchmark ?? "";
  const title = `${label ?? ""}${bench ? ` • ${bench}` : ""}`.trim();

  return (
    <div className={s.tip}>
      <div className={s.tipTitle}>{title}</div>
      {payload.map((p) => (
        <div key={`${p.dataKey}-${p.value}`} className={s.tipRow}>
          <span className={s.tipKey}>
            {(scoreType || "Score").toUpperCase()} diff
          </span>
          <span className={s.tipVal} style={{ color: p.fill }}>
            {p.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function CompareDiffGraph({ values = [], scoreType = "score" }) {
  if (!Array.isArray(values) || values.length === 0) return null;

  return (
    <section className={s.wrap} aria-label="Difference graph">
      <div className={s.chart}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={values}
            stackOffset="sign"
            margin={{ top: 25, right: 20, left: -15, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis fontSize={12} tickMargin={6}>
              <Label value="Benchmark" fontSize={13} position="bottom" />
            </XAxis>

            <YAxis
              type="number"
              fontSize={12}
              label={{
                value: `DIFF`,
                angle: 0,
                position: "top",
                offset: 12,
                fontSize: 12,
              }}
            />

            <ReferenceLine y={0} stroke="currentColor" opacity={0.35} />

            <Tooltip
              wrapperStyle={{ outline: "none" }}
              content={<Tip scoreType={scoreType} />}
            />

            <Bar dataKey="diffScore" fill="#5580E4" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
