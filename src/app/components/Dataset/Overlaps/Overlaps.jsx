"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import s from "./Overlaps.module.css";

const nf = new Intl.NumberFormat("en", { maximumFractionDigits: 2 });

function tsvRows(tsvLines = []) {
  // expects: array of lines split by "\t" already (your current format)
  if (!Array.isArray(tsvLines) || tsvLines.length < 2) return [];
  const [headerLine, ...rows] = tsvLines;
  const headers = String(headerLine)
    .split("\t")
    .map((h) => h.trim());

  return rows
    .map((r) => String(r).split("\t"))
    .map((cols) => {
      const obj = {};
      for (let i = 0; i < headers.length; i++) {
        const key = headers[i];
        const raw = (cols[i] ?? "").trim();
        const num = Number(raw);
        obj[key] = raw !== "" && !Number.isNaN(num) ? num : raw;
      }
      return obj;
    });
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

function OverlapTooltip({ active, payload, label }) {
  if (!active || !payload?.length || !label) return null;

  const val = payload?.[0]?.value ?? 0;
  return (
    <Tip
      title={String(label)}
      rows={[{ label: "Overlap", value: `${nf.format(Number(val || 0))} %` }]}
    />
  );
}

export default function Overlaps({ values, result }) {
  const router = useRouter();

  const data = useMemo(() => {
    const rows = tsvRows(values);

    // original logic: include only if A∩B/A > 1
    const out = [];
    for (const r of rows) {
      const perc = Number(r["A∩B/A"] ?? 0);
      if (!(perc > 1)) continue;

      const corpus = String(r["corpus B"] ?? "").trim();
      const version = String(r["release B"] ?? "").trim();
      if (!corpus || !version) continue;

      out.push({
        corpus,
        version,
        name: `${corpus} ${version}`,
        perc,
      });
    }
    return out;
  }, [values]);

  const numbers = useMemo(
    () => [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
    [],
  );

  const ready =
    Array.isArray(data) &&
    data.length > 0 &&
    Array.isArray(result) &&
    result.length >= 2 &&
    result[0]?.label &&
    result[1]?.label;

  if (!ready) return null;

  // Brand-aligned overlap color (sits between your purple and mint)
  const overlapFill = "#76CDEC"; // keep as your “overlap cyan”
  const overlapActive = "#A7E6FA"; // lighter active bar

  return (
    <section className={s.wrap}>
      <header className={s.head}>
        <h2 className={s.h2}>
          Overlap graph for {result[0].label} - {result[1].label}
        </h2>
        <p className={s.p}>
          This graph shows the most significant overlaps with other datasets.
        </p>
      </header>

      <div className={s.chart}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data}
            margin={{ top: 8, right: 10, left: 0, bottom: 8 }}
            onClick={(node) => {
              const p = node?.activePayload?.[0]?.payload;
              if (!p?.corpus || !p?.version) return;
              router.push(`/datasets/${p.corpus}/${p.version}`);
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" fontSize={12} tickMargin={8} />
            <YAxis type="number" unit=" %" ticks={numbers} fontSize={12} />
            <Tooltip
              content={<OverlapTooltip />}
              wrapperStyle={{ outline: "none" }}
            />

            <Bar
              dataKey="perc"
              fill={overlapFill}
              activeBar={{ fill: overlapActive }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
