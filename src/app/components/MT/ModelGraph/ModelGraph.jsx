// components/MT/ModelGraph/ModelGraph.jsx
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
  Rectangle,
} from "recharts";

import { numberFormatter } from "../../../../../hooks/hooks";
import s from "./ModelGraph.module.css";

const COLORS = {
  opusHPLT: "#9d0208",
  opusOther: "#5580E4",
  external: "#F68558",
  contributed: "#5C8374",
  none: "",
};

function hasHPLT(item) {
  return typeof item?.model === "string" && item.model.includes("HPLT");
}

function fillFor(item, modelType, useModelTypeColors) {
  if (useModelTypeColors) {
    if (modelType === "opus")
      return hasHPLT(item) ? COLORS.opusHPLT : COLORS.opusOther;
    if (modelType === "external") return COLORS.external;
    if (modelType === "contributed") return COLORS.contributed;
    return COLORS.none;
  }

  switch (item?.catalog) {
    case "OPUS":
      return hasHPLT(item) ? COLORS.opusHPLT : COLORS.opusOther;
    case "External":
      return COLORS.external;
    case "Contributed":
      return COLORS.contributed;
    default:
      return COLORS.none;
  }
}

function TipRow({ label, value, color }) {
  return (
    <div className={s.tipRow}>
      <span className={s.tipKey}>{label}</span>
      <span className={s.tipVal} style={color ? { color } : undefined}>
        {value}
      </span>
    </div>
  );
}

function Tip({
  active,
  payload,
  label,
  score,
  benchmark,
  modelType,
  useModelTypeColors,
}) {
  if (!active || !payload?.length) return null;

  const p0 = payload[0]?.payload || {};
  const showTestset = benchmark === "all" || benchmark === "none";
  const showModelName = benchmark !== "avg" && !showTestset;

  const titleParts = [];
  if (label) titleParts.push(label);
  if (showTestset && p0?.testset) titleParts.push(p0.testset);

  const title = titleParts.join(" • ");

  // Most cases will only have 1 bar, but keep mapping stable
  const rows = payload.map((entry) => {
    const row = entry?.payload || {};
    const color = fillFor(row, modelType, useModelTypeColors);
    const metric = String(score || "").toUpperCase();

    const scoreVal = Number(entry.value);
    const scoreTxt = Number.isFinite(scoreVal) ? scoreVal.toFixed(2) : "—";

    return {
      key: `${row.model || "row"}-${entry.dataKey}-${scoreTxt}`,
      model: row.model,
      metric,
      scoreTxt,
      color,
      row,
    };
  });

  return (
    <div className={s.tip}>
      {title ? <div className={s.tipTitle}>{title}</div> : null}

      <div className={s.tipBody}>
        {rows.map((r) => (
          <div key={r.key} className={s.tipBlock}>
            {showModelName && r.model ? (
              <div className={s.tipSub}>{r.model}</div>
            ) : null}

            <TipRow
              label={`${r.metric} score`}
              value={r.scoreTxt}
              color={r.color}
            />

            {/* Sizes — keep your original conditions */}
            {(modelType === "all" || modelType === "opus") &&
            r.row?.size &&
            benchmark !== "avg" ? (
              <TipRow label="Model size" value={numberFormatter(r.row.size)} />
            ) : null}

            {(modelType === "all" || modelType === "external") &&
            r.row?.externalSize &&
            benchmark !== "avg" ? (
              <TipRow
                label="External model size"
                value={numberFormatter(r.row.externalSize)}
              />
            ) : null}

            {benchmark === "avg" && r.row?.size ? (
              <TipRow label="Model size" value={numberFormatter(r.row.size)} />
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ModelGraph({
  dashboardValues = [],
  score = "bleu",
  modelType = "all",
  benchmark = "all",
}) {
  const data = Array.isArray(dashboardValues) ? dashboardValues : [];

  const useModelTypeColors =
    (Array.isArray(dashboardValues) && modelType === "opus") ||
    modelType === "external" ||
    modelType === "contributed";

  const barShape = (props) => (
    <Rectangle
      {...props}
      fill={fillFor(props.payload, modelType, useModelTypeColors)}
    />
  );

  return (
    <section className={s.wrap}>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          stackOffset="sign"
          reverseStackOrder={false}
          barSize={modelType === "all" ? 20 : undefined}
          margin={{ top: 25, right: 0, left: 0, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis fontSize={12} tickMargin={5}>
            <Label
              value="Benchmark"
              offset={-15}
              position="insideBottom"
              fontSize={14}
            />
          </XAxis>

          <YAxis
            type="number"
            unit=""
            fontSize={12}
            label={{
              value: String(score || "").toUpperCase(),
              angle: 0,
              position: "top",
              offset: 12,
              fontSize: 12,
            }}
          />

          <ReferenceLine y={0} stroke="currentColor" opacity={0.35} />

          <Tooltip
            wrapperStyle={{ outline: "none" }}
            content={
              <Tip
                score={score}
                benchmark={benchmark}
                modelType={modelType}
                useModelTypeColors={useModelTypeColors}
              />
            }
          />

          {/* Keep actual value under a real key for stable tooltip behavior */}
          <Bar dataKey="score" shape={barShape} />
        </BarChart>
      </ResponsiveContainer>
    </section>
  );
}
