// components/SampleBlock/SampleBlock.jsx
import s from "./SampleBlock.module.css";

const RTL = new Set(["ara", "fas", "heb", "pus", "uig", "urd", "yid"]);

function isRTL(code = "") {
  return RTL.has(String(code));
}

function DiffText({ parts = [], rtl, s }) {
  return (
    <p className={rtl ? s.rtl : ""}>
      {parts.map((p, i) => {
        const key = `${i}-${p.value}`;
        if (p.added)
          return <span key={key} className={s.add}>{`{+ ${p.value} +}`}</span>;
        if (p.removed)
          return <span key={key} className={s.rem}>{`{- ${p.value} -}`}</span>;
        return <span key={key}>{p.value}</span>;
      })}
    </p>
  );
}

function Row({ label, tone, rtl, children }) {
  return (
    <div className={s.row}>
      <p className={`${s.k} ${tone ? s[tone] : ""}`}>{label}</p>
      <div className={s.v}>{children}</div>
    </div>
  );
}

export default function SampleBlock({
  languages,
  idx,
  startNum,
  sourceData,
  targetData,
  modelType,
  modelOneData,
  modelTwoData,
  modelThreeData,
  showDiff,
  allDiff,
}) {
  const i = idx + startNum;

  const srcCode = languages?.[0]?.value ?? "";
  const trgCode = languages?.[1]?.value ?? "";
  const rtlSrc = isRTL(srcCode);
  const rtlTrg = isRTL(trgCode);

  const src = sourceData?.[i] ?? "";
  const ref = targetData?.[i] ?? "";

  // Build model rows based on current mode (same behavior as original)
  const modelRows =
    modelType === "all"
      ? [
          { label: "Model 1", tone: "m1", text: modelOneData?.[i] ?? "" },
          { label: "Model 2", tone: "m2", text: modelTwoData?.[i] ?? "" },
          ...(modelThreeData
            ? [
                {
                  label: "Model 3",
                  tone: "m3",
                  text: modelThreeData?.[i] ?? "",
                },
              ]
            : []),
        ]
      : modelType === "opus"
      ? [{ label: "Model", tone: "m1", text: modelOneData?.[i] ?? "" }]
      : modelType === "external"
      ? [{ label: "Model", tone: "m2", text: modelTwoData?.[i] ?? "" }]
      : modelType === "contributed"
      ? [{ label: "Model", tone: "m3", text: modelThreeData?.[i] ?? "" }]
      : [];

  const diffAll = showDiff && modelType !== "all";
  const diff12 = showDiff && modelType === "all" && modelThreeData;
  const diffSimpleAll = showDiff && modelType === "all" && !modelThreeData;

  const diffItem = allDiff?.[i];

  return (
    <article className={s.card}>
      <Row label="Source" rtl={rtlSrc}>
        <p className={rtlSrc ? s.rtl : ""}>{src}</p>
      </Row>

      <Row label="Reference" rtl={rtlTrg}>
        <p className={rtlTrg ? s.rtl : ""}>{ref}</p>
      </Row>

      {modelRows.map((r) => (
        <Row
          key={`${r.label}-${r.tone}`}
          label={`${r.label}`}
          tone={r.tone}
          rtl={rtlTrg}
        >
          <p className={rtlTrg ? s.rtl : ""}>{r.text}</p>
        </Row>
      ))}

      {diffAll && (
        <Row label="Difference" tone="diff" rtl={rtlTrg}>
          <DiffText parts={diffItem || []} rtl={rtlTrg} s={s} />
        </Row>
      )}

      {diffSimpleAll && (
        <Row label="Difference" tone="diff" rtl={rtlTrg}>
          <DiffText parts={diffItem || []} rtl={rtlTrg} s={s} />
        </Row>
      )}

      {diff12 && (
        <div className={s.diffs}>
          <Row label="Diff (1-2)" tone="diff" rtl={rtlTrg}>
            <DiffText parts={diffItem?.diffOne || []} rtl={rtlTrg} s={s} />
          </Row>
          <Row label="Diff (1-3)" tone="diff" rtl={rtlTrg}>
            <DiffText parts={diffItem?.diffTwo || []} rtl={rtlTrg} s={s} />
          </Row>
        </div>
      )}
    </article>
  );
}
