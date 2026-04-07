"use client";

import { useMemo, useCallback, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Share2 } from "lucide-react";
import { Toaster, toast } from "react-hot-toast";

import s from "./Buttons.module.css";

function buildHref({ source, target, score, benchmark, model }) {
  const sp = new URLSearchParams();
  if (source) sp.set("source", source);
  if (target) sp.set("target", target);
  sp.set("score", score || "bleu");
  sp.set("benchmark", benchmark || "all");
  sp.set("model", model || "all");
  return `/mt?${sp.toString()}`;
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      return true;
    } catch {
      return false;
    }
  }
}

export default function DashboardButtons({
  origin = "eng",
  target = "fra",
  score = "bleu",
  benchmark = "all",
  modelType = "all",
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const baseUrl = useMemo(() => {
    if (typeof window === "undefined") return "https://opusdemo.prompsit.com";
    return window.location.origin;
  }, []);

  const shareUrl = useMemo(() => {
    const qs = searchParams?.toString();
    return `${baseUrl}${pathname}${qs ? `?${qs}` : ""}`;
  }, [baseUrl, pathname, searchParams]);

  const push = useCallback(
    (next) => router.push(next, { scroll: false }),
    [router]
  );

  const [copyBusy, setCopyBusy] = useState(false);

  const onShare = useCallback(async () => {
    if (copyBusy) return;
    setCopyBusy(true);
    const ok = await copyText(shareUrl);
    setCopyBusy(false);
    ok ? toast.success("URL copied to clipboard!") : toast.error("Copy failed");
  }, [shareUrl, copyBusy]);

  const modelOptions = [
    { value: "all", label: "All" },
    { value: "opus", label: "OPUS-MT" },
    { value: "external", label: "External" },
    { value: "contributed", label: "Contributed" },
  ];

  const benchOptions = [
    { value: "all", label: "All" },
    { value: "avg", label: "Average score" },
  ];

  const scoreOptions = [
    { value: "bleu", label: "BLEU" },
    { value: "spbleu", label: "SPBLEU" },
    { value: "chrf", label: "CHRF" },
    { value: "chrf++", label: "CHRF++" },
    { value: "comet", label: "COMET" },
  ];

  return (
    <div className={s.bar}>
      {/* Models */}
      <div className={s.group}>
        <p className={s.label}>Models</p>

        <div className={s.buttons}>
          {modelOptions.map((m) => (
            <Link
              key={m.value}
              className={m.value === modelType ? s.btnActive : s.btn}
              href={buildHref({
                source: origin,
                target,
                score,
                benchmark: benchmark === "none" ? "all" : benchmark,
                model: m.value,
              })}
            >
              {m.label}
            </Link>
          ))}
        </div>

        <div className={s.selectOnly}>
          <select
            className={s.select}
            value={modelType}
            onChange={(e) =>
              push(
                buildHref({
                  source: origin,
                  target,
                  score,
                  benchmark: benchmark === "none" ? "all" : benchmark,
                  model: e.target.value,
                })
              )
            }
            aria-label="Select model group"
          >
            {modelOptions.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Benchmark */}
      <div className={s.group}>
        <p className={s.label}>Benchmark</p>

        <div className={s.buttons}>
          {benchOptions.map((b) => (
            <Link
              key={b.value}
              className={b.value === benchmark ? s.btnActive : s.btn}
              href={buildHref({
                source: origin,
                target,
                score,
                benchmark: b.value,
                model: benchmark === "none" ? "all" : modelType,
              })}
            >
              {b.label}
            </Link>
          ))}
        </div>

        <div className={s.selectOnly}>
          <select
            className={s.select}
            value={benchmark === "avg" ? "avg" : "all"}
            onChange={(e) =>
              push(
                buildHref({
                  source: origin,
                  target,
                  score,
                  benchmark: e.target.value,
                  model: benchmark === "none" ? "all" : modelType,
                })
              )
            }
            aria-label="Select benchmark mode"
          >
            {benchOptions.map((b) => (
              <option key={b.value} value={b.value}>
                {b.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Score */}
      <div className={s.group}>
        <p className={s.label}>Metric</p>

        <div className={s.buttons}>
          {scoreOptions.map((m) => (
            <Link
              key={m.value}
              className={m.value === score ? s.btnActive : s.btn}
              href={buildHref({
                source: origin,
                target,
                score: m.value,
                benchmark,
                model: modelType,
              })}
            >
              {m.label}
            </Link>
          ))}
        </div>

        <div className={s.selectOnly}>
          <select
            className={s.select}
            value={score}
            onChange={(e) =>
              push(
                buildHref({
                  source: origin,
                  target,
                  score: e.target.value,
                  benchmark,
                  model: modelType,
                })
              )
            }
            aria-label="Select evaluation metric"
          >
            {scoreOptions.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Share */}
      <div className={s.share}>
        <p className={s.label}>Share</p>
        <button
          type="button"
          className={s.shareBtn}
          onClick={onShare}
          disabled={copyBusy}
          aria-label="Copy URL"
          title="Copy URL"
        >
          <Share2 size={18} />
        </button>
        <Toaster />
      </div>
    </div>
  );
}
