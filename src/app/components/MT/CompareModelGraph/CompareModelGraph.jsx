// components/CompareModelGraph/CompareModelGraph.jsx
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

import s from "./CompareModelGraph.module.css";

function Tip({ active, payload, label, scoreType }) {
  if (!active || !payload?.length) return null;

  const bench = payload?.[0]?.payload?.benchmark ?? "";
  const title = `${label ?? ""}${bench ? ` • ${bench}` : ""}`.trim();

  return (
    <div className={s.tip}>
      <div className={s.tipTitle}>{title}</div>

      <div className={s.tipRows}>
        {payload.map((p) => {
          const key = `${p.dataKey}-${p.value}`;
          return (
            <div key={key} className={s.tipRow}>
              <span className={s.tipKey}>{p.name || p.dataKey}</span>
              <span className={s.tipVal} style={{ color: p.fill }}>
                {scoreType?.toUpperCase?.() || "SCORE"}: {p.value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function CompareModelGraph({
  graphValues = [],
  scoreType = "score",
}) {
  if (!Array.isArray(graphValues) || graphValues.length === 0) return null;

  return (
    <section className={s.wrap} aria-label="Model comparison graph">
      <div className={s.chart}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={graphValues}
            margin={{ top: 25, right: 20, left: -15, bottom: 20 }}
            barSize={20}
          >
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis fontSize={12} tickMargin={6}>
              <Label value="Benchmark" offset={-10} position="insideBottom" />
            </XAxis>

            <YAxis
              fontSize={12}
              type="number"
              label={{
                value: `${scoreType.toUpperCase()}`,
                angle: 0,
                position: "top",
                offset: 15,
                fontSize: 12,
              }}
            />

            <ReferenceLine y={0} stroke="currentColor" opacity={0.35} />

            <Tooltip
              wrapperStyle={{ outline: "none" }}
              content={<Tip scoreType={scoreType} />}
            />

            <Bar dataKey="scoreOne" fill="#5580E4" name="Model 1" />
            <Bar dataKey="scoreTwo" fill="#2CB9B1" name="Model 2" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
