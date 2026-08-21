"use client";
import { Suspense } from "react";

import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, Search, Share2, SquareX } from "lucide-react";
import { toast } from "@/app/components/ui/Toast/toast";

import dynamic from "next/dynamic";
const CompareModelGraph = dynamic(
  () => import("@/app/components/MT/CompareModelGraph/CompareModelGraph"),
);
const CompareDiffGraph = dynamic(
  () => import("@/app/components/MT/CompareDiffGraph/CompareDiffGraph"),
);
import DashboardLoader from "@/app/components/MT/Loader/Loader";

import MiniSelect from "@/app/components/Search/MiniSelect/MiniSelect";
import { codeToLangTransformer } from "../../../../hooks/hooks";

import s from "./page.module.css";

const METRICS = ["bleu", "spbleu", "chrf", "chrf++", "comet"];

function qsGet(sp, k, fallback = "") {
  const v = sp.get(k);
  return v == null ? fallback : v;
}

function encModelPath(m = "") {
  return encodeURIComponent(String(m));
}

function CompareModelsFallback() {
  // Keep it simple (or show skeleton UI)
  return <div style={{ padding: 16 }}>Loading filters…</div>;
}

function buildUrl({ src, trg, score, m1, m2 }) {
  const p = new URLSearchParams();
  p.set("src", src);
  p.set("trg", trg);
  p.set("score", score);
  // always present (required, as requested)
  p.set("m1", m1 || "models");
  p.set("m2", m2 || "models");
  return `/mt/compare-models?${p.toString()}`;
}

export default function CompareModelsClient({
  sourceData = [],
  targetData = [],
}) {
  const router = useRouter();
  const sp = useSearchParams();

  // avoid hydration mismatches from language-name rendering differences (Node vs browser)
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // URL state (required)
  const srcQ = qsGet(sp, "src");
  const trgQ = qsGet(sp, "trg");
  const scoreQ = qsGet(sp, "score", "bleu");
  const m1Q = qsGet(sp, "m1", "models");
  const m2Q = qsGet(sp, "m2", "models");

  // controlled local state
  const [src, setSrc] = useState(srcQ);
  const [trg, setTrg] = useState(trgQ);
  const [score, setScore] = useState(scoreQ);

  const [m1, setM1] = useState(m1Q === "models" ? "" : m1Q);
  const [m2, setM2] = useState(m2Q === "models" ? "" : m2Q);

  // fetched state
  const [models, setModels] = useState(null); // null | "notfound" | [{model: "..."}]
  const [table, setTable] = useState(null); // null | "loading" | 404 | { rows, avg... }

  const [avg1, setAvg1] = useState("");
  const [avg2, setAvg2] = useState("");
  const [avgDiff, setAvgDiff] = useState("");

  // sync URL -> local (when user navigates/back/forward)
  useEffect(() => {
    setSrc(srcQ);
    setTrg(trgQ);
    setScore(scoreQ);

    setM1(m1Q === "models" ? "" : m1Q);
    setM2(m2Q === "models" ? "" : m2Q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [srcQ, trgQ, scoreQ, m1Q, m2Q]);

  // language options (computed only on client to avoid SSR mismatch)
  const [srcOpts, setSrcOpts] = useState([]);
  const [trgOpts, setTrgOpts] = useState([]);
  useEffect(() => {
    if (!mounted) return;
    setSrcOpts(codeToLangTransformer(sourceData));
    // avoid mutating props (your old .pop())
    setTrgOpts(codeToLangTransformer(targetData));
  }, [mounted, sourceData, targetData]);

  // fetch models list for a pair
  useEffect(() => {
    if (!src || !trg) return;

    let alive = true;
    setModels(null);

    (async () => {
      try {
        const res = await fetch(`/api/compareModels/${src}&${trg}&bleu`, {
          method: "GET",
          cache: "no-store",
        });

        if (!alive) return;

        const json = await res.json().catch(() => null);
        if (!res.ok || json === 404 || !json) {
          setModels("notfound");
        } else {
          setModels(json);
        }
      } catch {
        if (alive) setModels("notfound");
      }
    })();

    return () => {
      alive = false;
    };
  }, [src, trg]);

  const hasSelection = Boolean(m1 && m2);

  // fetch comparison table when two models selected
  useEffect(() => {
    if (!src || !trg || !score || !m1 || !m2) return;

    let alive = true;
    setTable("loading");

    (async () => {
      try {
        const m1p = encModelPath(m1);
        const m2p = encModelPath(m2);

        const res = await fetch(
          `/api/modelData/${m1p}&${m2p}&${src}&${trg}&${score}`,
          {
            method: "GET",
            cache: "no-store",
          },
        );

        const json = await res.json().catch(() => null);
        if (!alive) return;

        if (json === 404 || !json) {
          setTable(404);
          return;
        }

        setTable(Array.isArray(json.tableData) ? json.tableData : []);
        setAvg1(String(json.modelOneScoreAvg ?? ""));
        setAvg2(String(json.modelTwoScoreAvg ?? ""));
        setAvgDiff(String(json.diffAvg ?? ""));
      } catch {
        if (alive) setTable(404);
      }
    })();

    return () => {
      alive = false;
    };
  }, [src, trg, score, m1, m2]);

  // filter model options to avoid re-selecting already chosen ones
  const modelOpts = useMemo(() => {
    if (!Array.isArray(models)) return [];
    const banned = new Set([m1, m2].filter(Boolean));
    return models
      .filter((x) => x?.model && !banned.has(x.model))
      .map((x) => ({ label: x.model, value: x.model }));
  }, [models, m1, m2]);

  const goToPair = useCallback(
    (next) => {
      router.push(buildUrl(next));
    },
    [router],
  );

  const applyMetric = (nextScore) => {
    setTable(null);
    setAvg1("");
    setAvg2("");
    setAvgDiff("");
    goToPair({ src, trg, score: nextScore, m1: "", m2: "" });
  };

  const runSearch = () => {
    setModels(null);
    setTable(null);
    setAvg1("");
    setAvg2("");
    setAvgDiff("");
    goToPair({ src, trg, score, m1: "", m2: "" });
  };

  function pickModel(model) {
    if (!model) return;
    if (!m1) return setM1(model);
    if (!m2 && model !== m1) return setM2(model);
  }

  // once both set locally, persist into URL (required, like dashboard)
  useEffect(() => {
    if (!src || !trg || !score) return;
    if (!m1 || !m2) return;
    router.replace(buildUrl({ src, trg, score, m1, m2 }), { scroll: false });
  }, [router, src, trg, score, m1, m2]);

  const canRender = mounted && srcOpts.length && trgOpts.length;

  const showBadUrl = !srcQ || !trgQ || !scoreQ;

  async function copyShare() {
    try {
      const href = window.location.href;
      await navigator.clipboard.writeText(href);
      toast.success("URL copied to clipboard!");
    } catch {
      toast.error("Could not copy URL");
    }
  }

  return (
    <Suspense fallback={<CompareModelsFallback />}>
      <main className={s.page}>
        {showBadUrl && (
          <section className={s.card}>
            <h1 className={s.h1}>Missing URL parameters</h1>
            <p className={s.p}>
              This page expects: <code>src</code>, <code>trg</code>,{" "}
              <code>score</code>, <code>m1</code>, <code>m2</code>.
            </p>
            <p className={s.p}>
              Example:{" "}
              <code>
                /mt/compare-models?src=eng&trg=fra&score=bleu&m1=models&m2=models
              </code>
            </p>
          </section>
        )}

        <section className={s.card}>
          <header className={s.top}>
            <div className={s.metrics}>
              <span className={s.k}>Metric</span>
              <div className={s.chips}>
                {METRICS.map((m) => (
                  <button
                    key={m}
                    type="button"
                    className={`${s.chip} ${score === m ? s.chipOn : ""}`}
                    onClick={() => applyMetric(m)}
                  >
                    {m.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              className={s.share}
              onClick={copyShare}
              aria-label="Copy share URL"
            >
              <Share2 size={18} />
            </button>
          </header>

          <div className={s.row}>
            <div className={s.group}>
              <label className={s.lbl}>Source language</label>
              <div className={s.sel}>
                {canRender ? (
                  <MiniSelect
                    options={srcOpts}
                    value={src}
                    onChange={(v) => setSrc(v)}
                    placeholder="Select source"
                  />
                ) : (
                  <div className={s.skel} />
                )}
              </div>
            </div>

            <div className={s.group}>
              <label className={s.lbl}>Target language</label>
              <div className={s.sel}>
                {canRender ? (
                  <MiniSelect
                    options={trgOpts}
                    value={trg}
                    onChange={(v) => setTrg(v)}
                    placeholder="Select target"
                    disabled={!src}
                  />
                ) : (
                  <div className={s.skel} />
                )}
              </div>
            </div>

            <button
              type="button"
              className={s.go}
              onClick={runSearch}
              aria-label="Search models"
            >
              <Search size={18} />
            </button>
          </div>
        </section>

        {table === 404 && (
          <section className={s.card}>
            <div className={s.msg}>
              <div className={s.divider} />
              <h2 className={s.h2}>
                We&apos;re sorry, no comparison data was found. Try another
                metric, language pair, or different models.
              </h2>
              <div className={s.divider} />
            </div>
          </section>
        )}

        <section className={s.card}>
          <h1 className={s.h1}>Select two models to compare</h1>

          {models === null && (
            <DashboardLoader message={"Searching for models..."} />
          )}

          {models === "notfound" && (
            <div className={s.msg}>
              <div className={s.divider} />
              <h2 className={s.h2}>
                We&apos;re sorry, no models found for this language pair.
              </h2>
              <div className={s.divider} />
            </div>
          )}

          {Array.isArray(models) && (
            <>
              <div className={s.row}>
                <div className={s.groupWide}>
                  <label className={s.lbl}>Model 1</label>
                  <MiniSelect
                    options={modelOpts}
                    value={m1}
                    onChange={(v) => pickModel(v)}
                    placeholder="Pick first model…"
                    disabled={Boolean(m1)}
                  />
                  {m1 && (
                    <button
                      type="button"
                      className={s.clear}
                      onClick={() => setM1("")}
                      aria-label="Clear model 1"
                    >
                      <SquareX size={18} />
                    </button>
                  )}
                </div>

                <div className={s.groupWide}>
                  <label className={s.lbl}>Model 2</label>
                  <MiniSelect
                    options={modelOpts}
                    value={m2}
                    onChange={(v) => pickModel(v)}
                    placeholder="Pick second model…"
                    disabled={Boolean(m2)}
                  />
                  {m2 && (
                    <button
                      type="button"
                      className={s.clear}
                      onClick={() => setM2("")}
                      aria-label="Clear model 2"
                    >
                      <SquareX size={18} />
                    </button>
                  )}
                </div>
              </div>

              {(m1 || m2) && (
                <div className={s.picks}>
                  {m1 && (
                    <div className={s.pick}>
                      <span className={s.m1}>Model 1</span>
                      <span className={s.pickTxt}>{m1}</span>
                    </div>
                  )}
                  {m2 && (
                    <div className={s.pick}>
                      <span className={s.m2}>Model 2</span>
                      <span className={s.pickTxt}>{m2}</span>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </section>

        {table === "loading" && (
          <DashboardLoader message={"Retrieving scores..."} />
        )}

        {Array.isArray(table) && table.length > 0 && hasSelection && (
          <>
            <section className={s.card}>
              <header className={s.head2}>
                <div className={s.titles}>
                  <p className={s.t}>
                    Model 1:{" "}
                    <span className={`${s.m1} ${s.modelName}`}>{m1}</span>
                  </p>
                  <p className={s.t}>
                    Model 2:{" "}
                    <span className={`${s.m2} ${s.modelName}`}>{m2}</span>
                  </p>
                </div>

                <button
                  type="button"
                  className={s.close}
                  onClick={() => goToPair({ src, trg, score, m1: "", m2: "" })}
                >
                  Close selection <SquareX size={18} />
                </button>
              </header>

              <div className={s.main}>
                <div className={s.graph}>
                  <CompareModelGraph graphValues={table} scoreType={score} />
                  <CompareDiffGraph values={table} scoreType={score} />
                </div>
                <div className={s.tableWrap}>
                  <table className={s.table}>
                    <thead>
                      <tr>
                        <th className={s.id}>ID</th>
                        <th>Benchmark</th>
                        <th className={s.c}>Output</th>
                        <th className={s.c}>Model 1</th>
                        <th className={s.c}>Model 2</th>
                        <th className={s.c}>Diff</th>
                      </tr>
                    </thead>

                    <tbody>
                      {table.map((row, i) => {
                        const { benchmark, scoreOne, scoreTwo, diffScore } =
                          row || {};

                        const key = `${benchmark || "bench"}::${i}`;

                        const compareHref = `/mt/compare?dataset=${benchmark}&src=${src}&trg=${trg}&type=${"all"}&m1=${encModelPath(
                          m1,
                        )}&m2=${encModelPath(m2)}&m3=none&from=dashboard`;

                        return (
                          <tr key={key}>
                            <td className={s.id}>{i}</td>
                            <td>
                              <Link
                                className={s.link}
                                href={`/mt?source=${src}&target=${trg}&score=${score}&benchmark=${benchmark}&model=all`}
                              >
                                {benchmark}
                              </Link>
                            </td>
                            <td className={s.c}>
                              <Link
                                className={s.iconBtn}
                                href={compareHref}
                                aria-label="Open output comparison"
                              >
                                <Eye width={18} />
                              </Link>
                            </td>
                            <td className={s.c}>{scoreOne}</td>
                            <td className={s.c}>{scoreTwo}</td>
                            <td className={s.c}>{diffScore}</td>
                          </tr>
                        );
                      })}

                      <tr className={s.sum}>
                        <td />
                        <td />
                        <td>Average</td>
                        <td className={s.c}>{avg1 !== "NaN" ? avg1 : ""}</td>
                        <td className={s.c}>{avg2 !== "NaN" ? avg2 : ""}</td>
                        <td className={s.c}>
                          {avgDiff !== "NaN" ? avgDiff : ""}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </>
        )}
      </main>
    </Suspense>
  );
}
