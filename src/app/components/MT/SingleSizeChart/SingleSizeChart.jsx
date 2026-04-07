// components/SingleSizeChart/SingleSizeChart.jsx
"use client";

import { useMemo } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LabelList,
  Label,
  ResponsiveContainer,
  ZAxis,
} from "recharts";

import { DataFormatter, numberFormatter } from "../../../../../hooks/hooks";
import s from "./SingleSizeChart.module.css";

function isHplt(name = "") {
  return String(name).includes("HPLT");
}

function pickFill(catalog, model) {
  const cat = String(catalog || "");
  if (cat === "OPUS") return isHplt(model) ? "#9d0208" : "#5580E4";
  return "#F68558";
}

function fmtScore(val) {
  const n = Number(val);
  return Number.isFinite(n) ? Number(n.toFixed(2)) : null;
}

function TooltipCard({ active, payload, metric }) {
  if (!active || !payload?.length) return null;

  const p = payload[0]?.payload;
  if (!p) return null;

  return (
    <div className={s.tip}>
      <div className={s.tipHead}>
        <span className={s.badge}>{p.testset ?? "—"}</span>
        <span className={s.tipTitle} title={p.model || ""}>
          {p.model || "—"}
        </span>
      </div>

      <div className={s.tipRow}>
        <span className={s.k}>Size</span>
        <span className={s.v}>{numberFormatter(p.size)}</span>
      </div>

      <div className={s.tipRow}>
        <span className={s.k}>{metric.toUpperCase()}</span>
        <span className={s.v}>{p.score ?? "—"}</span>
      </div>
    </div>
  );
}

export default function SingleSizeChart({ data, score = "bleu" }) {
  const scatterData = useMemo(() => {
    const rows = Array.isArray(data) ? data : [];
    const out = [];

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      if (!r?.size) continue;

      const size = Number(r.size);
      if (!Number.isFinite(size) || size <= 0) continue;

      const sc = fmtScore(r.score);
      if (sc == null) continue;

      out.push({
        id: `${r.catalog || "x"}::${r.idx ?? i}::${r.model ?? "m"}::${i}`,
        testset: r.idx, // keep legacy label behavior
        model: r.model,
        score: sc,
        size,
        fill: pickFill(r.catalog, r.model),
      });
    }

    return out;
  }, [data]);
  if (!scatterData.length) return null;

  return (
    <div className={s.wrap}>
      <ResponsiveContainer width="100%" height={300}>
        <ScatterChart margin={{ top: 25, right: 0, bottom: 25, left: 10 }}>
          <CartesianGrid />

          <XAxis
            fontSize={12}
            type="number"
            dataKey="size"
            name="size"
            minTickGap={60}
            tickFormatter={DataFormatter}
            padding={{ left: 40, right: 40 }}
          >
            <Label
              value="Model size"
              offset={-15}
              position="insideBottom"
              fontSize={13}
            />
          </XAxis>

          <YAxis
            fontSize={12}
            type="number"
            dataKey="score"
            name="score"
            label={{
              value: score.toUpperCase(),
              angle: 0,
              offset: 12,
              fontSize: 12,
              position: "top",
            }}
          />

          <ZAxis range={[130, 131]} />

          <Tooltip
            content={<TooltipCard metric={score} />}
            wrapperStyle={{ outline: "none" }}
          />

          {/* Keep one scatter; allow per-point fill using "fill" property */}
          <Scatter data={scatterData}>
            <LabelList
              dataKey="testset"
              position="left"
              fontSize={16}
              fontWeight={500}
            />
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
