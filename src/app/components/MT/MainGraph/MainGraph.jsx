import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
  Label,
} from "recharts";

import s from "./MainGraph.module.css";

const COLORS = {
  opusHPLT: "#9d0208",
  opusOther: "#5580E4",
  external: "#F68558",
  contributed: "#5C8374",
};

function TipRow({ k, v, color }) {
  return (
    <div className={s.tipRow}>
      <span className={s.k}>{k}</span>
      <span className={s.v} style={color ? { color } : undefined}>
        {v}
      </span>
    </div>
  );
}

function CustomTooltip({
  active,
  payload,
  label,
  score,
  benchmark,
  modelType,
}) {
  if (!active || !payload?.length) return null;

  const first = payload[0]?.payload;
  const showTestset = benchmark === "all";
  const showBenchmarkLabel = benchmark !== "avg" && benchmark !== "all";

  const metric = String(score || "").toUpperCase();

  // stable title: label + (optional) testset/benchmark
  const title = label ? String(label) : "";

  return (
    <div className={s.tip}>
      <div className={s.tipHead}>
        {title ? <div className={s.tipTitle}>{title}</div> : null}

        {showTestset && first?.testset ? (
          <span className={s.badge}>{first.testset}</span>
        ) : null}

        {showBenchmarkLabel ? (
          <span className={s.badge}>{benchmark}</span>
        ) : null}
      </div>

      <div className={s.tipRows}>
        {payload.map((entry) => {
          const val = entry?.value;
          if (val == null || val === "") return null;

          const name = entry?.name || entry?.dataKey || "series";
          const key = `${first?.testset ?? ""}::${name}::${String(val)}`;

          return (
            <TipRow key={key} k={`${metric}`} v={val} color={entry?.fill} />
          );
        })}

        {(modelType === "all" || modelType === "opus") &&
        first?.size &&
        benchmark !== "avg" ? (
          <TipRow k="Model size" v={first.size} />
        ) : null}

        {(modelType === "all" || modelType === "external") &&
        first?.externalSize ? (
          <TipRow k="External size" v={first.externalSize} />
        ) : null}
      </div>
    </div>
  );
}

export default function MainGraph({
  values = [],
  score,
  modelType,
  benchmark,
}) {
  const showOpus = modelType === "all" || modelType === "opus";
  const showExternal = modelType === "all" || modelType === "external";
  const showContributed = modelType === "all" || modelType === "contributed";

  return (
    <div className={s.wrap}>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={values}
          stackOffset="sign"
          barSize={modelType === "all" ? 20 : undefined}
          margin={{ top: 25, right: 0, left: 0, bottom: 25 }}
        >
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis fontSize={12} tickMargin={5}>
            <Label
              value="Benchmark (see table)"
              offset={-15}
              position="insideBottom"
              fontSize={13}
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

          <ReferenceLine y={0} stroke="#ffffffff" />

          <Tooltip
            wrapperStyle={{ outline: "none" }}
            content={
              <CustomTooltip
                score={score}
                benchmark={benchmark}
                modelType={modelType}
              />
            }
          />

          {showOpus ? (
            <Bar dataKey="score" name="OPUS model">
              {values.map((entry, index) => {
                const isHPLT =
                  typeof entry?.model === "string" &&
                  entry.model.includes("HPLT");
                return (
                  <Cell
                    key={`opus-${entry?.testset ?? "t"}-${index}`}
                    fill={isHPLT ? COLORS.opusHPLT : COLORS.opusOther}
                  />
                );
              })}
            </Bar>
          ) : null}

          {showExternal ? (
            <Bar
              dataKey={(val) => val.external?.score}
              fill={COLORS.external}
              name="External model"
            />
          ) : null}

          {showContributed ? (
            <Bar
              dataKey={(val) => val.contributed?.score}
              fill={COLORS.contributed}
              name="Contributed model"
            />
          ) : null}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
