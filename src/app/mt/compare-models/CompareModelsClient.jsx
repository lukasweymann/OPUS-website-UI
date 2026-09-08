"use client";
import { Suspense } from "react";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Copy, Eye, Search, Share2, SquareX } from "lucide-react";
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
const METRIC_OPTIONS = METRICS.map((metric) => ({
  label: metric.toUpperCase(),
  value: metric,
}));

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

function ModelNameTooltip({ value, children }) {
  const [open, setOpen] = useState(false);
  const [tipStyle, setTipStyle] = useState(null);
  const anchorRef = useRef(null);

  useLayoutEffect(() => {
    if (!open || !value) return;

    function updatePosition() {
      const rect = anchorRef.current?.getBoundingClientRect();
      if (!rect) return;

      const viewportPad = 10;
      const gap = 8;
      const width = Math.min(720, window.innerWidth - viewportPad * 2);
      const left = Math.min(
        Math.max(viewportPad, rect.left + rect.width / 2 - width / 2),
        window.innerWidth - width - viewportPad,
      );
      const showAbove = rect.top > 112;
      const top = showAbove
        ? rect.top - gap
        : Math.min(rect.bottom + gap, window.innerHeight - viewportPad);

      setTipStyle({
        position: "fixed",
        top: `${top}px`,
        left: `${left}px`,
        width: `${width}px`,
        transform: showAbove ? "translateY(-100%)" : "none",
      });
    }

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, value]);

  const tooltip =
    open && value && tipStyle
      ? createPortal(
          <div className={s.modelTip} role="tooltip" style={tipStyle}>
            <span>Selected model</span>
            <code>{value}</code>
          </div>,
          document.body,
        )
      : null;

  return (
    <div
      ref={anchorRef}
      className={s.modelTipAnchor}
      onPointerEnter={() => setOpen(Boolean(value))}
      onPointerLeave={() => setOpen(false)}
      onFocus={() => setOpen(Boolean(value))}
      onBlur={() => setOpen(false)}
    >
      {children}
      {tooltip}
    </div>
  );
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
  const modelOneOpts = useMemo(() => {
    if (!Array.isArray(models)) return [];
    return models
      .filter((x) => x?.model && x.model !== m2)
      .map((x) => ({ label: x.model, value: x.model }));
  }, [models, m2]);

  const modelTwoOpts = useMemo(() => {
    if (!Array.isArray(models)) return [];
    return models
      .filter((x) => x?.model && x.model !== m1)
      .map((x) => ({ label: x.model, value: x.model }));
  }, [models, m1]);

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

  async function copyModelName(model) {
    try {
      await navigator.clipboard.writeText(model);
      toast.success("Model name copied");
    } catch {
      toast.error("Could not copy model name");
    }
  }

  function syncModelUrl(nextM1, nextM2) {
    if (!src || !trg || !score) return;
    router.replace(
      buildUrl({ src, trg, score, m1: nextM1, m2: nextM2 }),
      { scroll: false },
    );
  }

  function chooseModelOne(model) {
    setTable(null);
    setAvg1("");
    setAvg2("");
    setAvgDiff("");
    setM1(model);
    syncModelUrl(model, m2);
  }

  function chooseModelTwo(model) {
    setTable(null);
    setAvg1("");
    setAvg2("");
    setAvgDiff("");
    setM2(model);
    syncModelUrl(m1, model);
  }

  function clearSelection() {
    setM1("");
    setM2("");
    setTable(null);
    setAvg1("");
    setAvg2("");
    setAvgDiff("");
    goToPair({ src, trg, score, m1: "", m2: "" });
  }

  function ModelControl({ label, tone, value, options, onChange, onClear }) {
    return (
      <div className={s.groupWide}>
        <div className={s.modelLabelRow}>
          <label className={s.lbl}>{label}</label>
          {value && (
            <div className={s.modelActions}>
              <button
                type="button"
                onClick={() => copyModelName(value)}
                title={`Copy ${label.toLowerCase()} name`}
                aria-label={`Copy ${label.toLowerCase()} name`}
              >
                <Copy size={14} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={onClear}
                title={`Clear ${label.toLowerCase()}`}
                aria-label={`Clear ${label.toLowerCase()}`}
              >
                <SquareX size={14} aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
        <ModelNameTooltip value={value}>
          <MiniSelect
            options={options}
            value={value}
            onChange={onChange}
            placeholder={`Pick ${label.toLowerCase()}…`}
            labelClassName={s[`${tone}Value`]}
          />
        </ModelNameTooltip>
      </div>
    );
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

        <section className={`${s.card} ${s.controlPanel}`}>
          <div className={s.commandRow}>
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

            <div className={`${s.group} ${s.metricGroup}`}>
              <label className={s.lbl}>Metric</label>
              <div className={s.metricSelect}>
                <MiniSelect
                  options={METRIC_OPTIONS}
                  value={score}
                  onChange={applyMetric}
                  placeholder="Metric"
                />
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

            <button
              type="button"
              className={s.share}
              onClick={copyShare}
              aria-label="Copy share URL"
            >
              <Share2 size={18} />
            </button>
          </div>

          <div className={s.modelBlock}>
            <header className={s.sectionHead}>
              <h1 className={s.h1}>Models to compare</h1>
              {(m1 || m2) && (
                <button
                  type="button"
                  className={s.clearSelection}
                  onClick={clearSelection}
                >
                  Clear selection <SquareX size={17} aria-hidden="true" />
                </button>
              )}
            </header>

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
              <div className={`${s.row} ${s.modelPickerRow}`}>
                <ModelControl
                  label="Model 1"
                  tone="m1"
                  value={m1}
                  options={modelOneOpts}
                  onChange={chooseModelOne}
                  onClear={() => chooseModelOne("")}
                />
                <ModelControl
                  label="Model 2"
                  tone="m2"
                  value={m2}
                  options={modelTwoOpts}
                  onChange={chooseModelTwo}
                  onClear={() => chooseModelTwo("")}
                />
              </div>
            )}
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

        {table === "loading" && (
          <DashboardLoader message={"Retrieving scores..."} />
        )}

        {Array.isArray(table) && table.length > 0 && hasSelection && (
          <>
            <section className={s.card}>
              <header className={s.head2}>
                <div>
                  <p className={s.k}>Comparison</p>
                  <h2 className={s.h2}>Scores by benchmark</h2>
                </div>

                <button
                  type="button"
                  className={s.close}
                  onClick={clearSelection}
                >
                  Clear selection <SquareX size={18} />
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
