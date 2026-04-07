import Link from "next/link";
import s from "./NotFound.module.css";
import b from "../../../../../styles/Buttons.module.css";

function enc(v = "") {
  return String(v).replaceAll("/", "%2F");
}

function ModelLine({ tone, label, value }) {
  if (!value) return null;
  return (
    <p className={`${s.model} ${tone ? s[tone] : ""}`}>
      <span className={s.modelKey}>{label}</span>
      <span className={s.modelVal}>{value}</span>
    </p>
  );
}

export default function CompareNotFound({
  redirectPage,
  languages,
  routerInfo,
  dataset,
  modelType,
  modelOne,
  modelTwo,
  modelThree,
  modelThreeData,
}) {
  const sourceLang = languages[0].label;
  const targetLang = languages[1].label;

  const sourceCode = languages[0].value;
  const targetCode = languages[1].value;

  const backHref =
    redirectPage === "models"
      ? `/compare-models/${sourceCode}&${targetCode}&bleu/${enc(
          modelOne
        )}&${enc(modelTwo)}`
      : `/mt/${sourceCode}&${targetCode}&${routerInfo?.[3]}/bleu&all`;

  const showAll = modelType === "all";

  return (
    <section className={s.wrap} aria-label="No sample data">
      <header className={s.head}>
        <div className={s.titleRow}>
          <h1 className={s.h1}>Benchmark Translations</h1>
          <Link className={b.secondaryButton} href={backHref}>
            Back to search
          </Link>
        </div>

        <p className={s.meta}>
          <span className={s.metaKey}>Testset</span>
          <span className={s.metaVal}>{dataset || "—"}</span>
          <span className={s.dot} aria-hidden="true">
            ·
          </span>
          <span className={s.metaKey}>Pair</span>
          <span className={s.metaVal}>
            {sourceLang || "—"} – {targetLang || "—"}
          </span>
        </p>

        {showAll ? (
          <div className={s.models}>
            <ModelLine tone="m1" label="Model 1" value={modelOne} />
            <ModelLine tone="m2" label="Model 2" value={modelTwo} />
            {modelThreeData && (
              <ModelLine tone="m3" label="Model 3" value={modelThree} />
            )}
          </div>
        ) : (
          <div className={s.models}>
            <ModelLine
              tone={modelType === "opus" ? "m1" : "m2"}
              label="Model"
              value={modelOne}
            />
          </div>
        )}
      </header>

      <div className={s.card}>
        <div className={s.rule} aria-hidden="true" />
        <p className={s.msg}>
          We couldn’t find sample data for this selection. <br></br>Try another
          language pair or choose a different model.
        </p>
        <div className={s.rule} aria-hidden="true" />
      </div>
    </section>
  );
}
