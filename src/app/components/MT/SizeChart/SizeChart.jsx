// components/SizeChart/SizeChart.jsx
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
import s from "./SizeChart.module.css";

function isHplt(name = "") {
  return String(name).includes("HPLT");
}

function fmtScore(val, metric) {
  const n = Number(val);
  if (!Number.isFinite(n)) return "";
  const digits = metric === "bleu" || metric === "spbleu" ? 1 : 3;
  return n.toFixed(digits);
}

function TooltipCard({ active, payload, metric }) {
  if (!active || !payload?.length) return null;
  const p = payload?.[0]?.payload;
  if (!p) return null;

  return (
    <div className={s.tip}>
      <div className={s.tipHead}>
        <span className={s.badge}>{p.testset}</span>
        <span className={s.tipTitle} title={`${p.model ?? ""}`}>
          {p.model}
        </span>
      </div>

      <div className={s.tipRow}>
        <span className={s.k}>Size</span>
        <span className={s.v}>{numberFormatter(p.size)}</span>
      </div>

      <div className={s.tipRow}>
        <span className={s.k}>{metric.toUpperCase()}</span>
        <span className={s.v}>{fmtScore(p.score, metric) || "—"}</span>
      </div>
    </div>
  );
}

export default function SizeChart({
  data,
  score = "bleu",
  modelType = "all",
  benchmark = "all",
}) {
  const scatterData = useMemo(() => {
    const rows = Array.isArray(data) ? data : [];
    const out = [];

    const isAvg = benchmark === "avg";
    const isAll = modelType === "all";

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i] || {};

      // AVG mode
      if (isAvg) {
        if (!row.size) continue;

        const fill =
          row.catalog === "OPUS"
            ? isHplt(row.model)
              ? "#9d0208"
              : "#5580E4"
            : "#F68558";

        out.push({
          id: `avg::${i}::${row.model ?? ""}`,
          testset: i, // keep legacy label behavior
          model: row.model,
          score: Number(row.score),
          size: Number(row.size),
          fill,
        });
        continue;
      }

      // ALL mode (OPUS + External)
      if (isAll) {
        if (row.size) {
          out.push({
            id: `opus::${row.idx ?? i}::${row.model ?? ""}`,
            testset: row.idx, // keep legacy label behavior
            model: row.model,
            score: Number(row.score),
            size: Number(row.size),
            fill: isHplt(row.model) ? "#9d0208" : "#5580E4",
          });
        }

        if (row.external?.size) {
          out.push({
            id: `ext::${row.idx ?? i}::${row.external.model ?? ""}`,
            testset: row.idx, // keep legacy label behavior
            model: row.external.model,
            score: Number(row.external.score),
            size: Number(row.external.size),
            fill: "#F68558",
          });
        }

        continue;
      }

      // Single source mode (opus/external/contributed view)
      if (!row.size) continue;

      const fill =
        modelType === "opus"
          ? isHplt(row.model)
            ? "#9d0208"
            : "#5580E4"
          : "#F68558";

      out.push({
        id: `single::${modelType}::${i}::${row.model ?? ""}`,
        testset: i, // keep legacy label behavior
        model: row.model,
        score: Number(row.score),
        size: Number(row.size),
        fill,
      });
    }

    return out;
  }, [data, modelType, benchmark]);

  if (!scatterData.length) return null;

  return (
    <section className={s.wrap} aria-label="Model size vs score scatter plot">
      <ResponsiveContainer width="100%" height={300}>
        <ScatterChart
          margin={{
            top: 22,
            right: 6,
            bottom: 22,
            left: 10,
          }}
        >
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
              offset={-14}
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
              value: `${score.toUpperCase()}`,
              angle: 0,
              offset: 12,
              fontSize: 12,
              position: "top",
            }}
          />

          {/* keep legacy fixed point sizing behavior */}
          <ZAxis range={[130, 131]} />

          <Tooltip
            content={<TooltipCard metric={score} />}
            wrapperStyle={{ outline: "none" }}
          />

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
    </section>
  );
}
