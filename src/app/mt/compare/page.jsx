// app/compare/page.jsx
import { notFound } from "next/navigation";
import { codeToLangTransformer } from "../../../../hooks/hooks";
import CompareClient from "./CompareClient";
import * as Diff from "diff";

export const dynamic = "force-dynamic";

const DIFFERENT_TESTSETS = [
  "europeana2021",
  "flores101-devtest",
  "flores200-devtest",
  "florestest2021",
  "generaltest2022",
];

function reqParam(searchParams, key) {
  const v = searchParams?.[key];
  if (v == null || v === "") return null;
  return Array.isArray(v) ? v[0] : String(v);
}

function decodeMaybe(v = "") {
  try {
    return decodeURIComponent(v);
  } catch {
    return v;
  }
}

async function fetchText(url) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Fetch failed ${res.status}: ${url}`);
  return res.text();
}

async function fetchTextOrEmpty(url, enabled) {
  if (!enabled) return "";
  return fetchText(url);
}

function splitLinesRaw(text) {
  // keep inner empty lines (index alignment), only trim trailing empties
  const arr = String(text).split("\n");
  while (arr.length && arr[arr.length - 1] === "") arr.pop();
  return arr;
}

function stripTrailingOnce(arr) {
  // mirrors old behavior when they did .pop() unconditionally
  if (Array.isArray(arr) && arr.length) arr.pop();
  return arr;
}

function isOpusLike(modelPath = "") {
  const s = String(modelPath);
  return (
    s.includes("OPUS-MT-models") || s.includes("Tatoeba") || s.includes("HPLT")
  );
}

function leaderboardRoot(modelPath = "") {
  return isOpusLike(modelPath)
    ? "OPUS-MT-leaderboard"
    : "External-MT-leaderboard";
}

function outputUrl(base, root, modelPath, dataset, src, trg) {
  return `${base}/${root}/master/models/${modelPath}/${dataset}.${src}-${trg}.output`;
}

async function fetchRefPairViaTsv(base, dataset, src, trg) {
  const tsv = await fetchText(
    `${base}/OPUS-MT-testsets/master/testsets/${dataset}.tsv`,
  );
  const rows = tsv.split("\n").map((r) => r.split("\t"));
  const hit = rows.find((r) => `${r?.[0]}-${r?.[1]}` === `${src}-${trg}`);
  if (!hit) throw new Error("Pair not found in testset TSV");
  return { sourcePath: hit[6], refPath: hit[7] };
}

async function fetchIndirectIfNeeded(base, fullPath) {
  // branch A behavior: if file contains 1 line -> replace last segment with that line
  const text = await fetchText(`${base}/OPUS-MT-testsets/master/${fullPath}`);
  let lines = splitLinesRaw(text);

  if (lines.length === 1) {
    const newName = lines[0];
    const parts = String(fullPath).split("/");
    parts[parts.length - 1] = newName;
    const fixed = parts.join("/");
    const t2 = await fetchText(`${base}/OPUS-MT-testsets/master/${fixed}`);
    lines = splitLinesRaw(t2);
  }
  return lines;
}

async function fetchIndirectFromPointer(base, pointerLine) {
  // branch B behavior: if file contains 1 line -> treat it as pointer path under /testsets/
  const fixed = String(pointerLine).replace("../", "");
  const text = await fetchText(
    `${base}/OPUS-MT-testsets/master/testsets/${fixed}`,
  );
  return splitLinesRaw(text);
}

async function fetchSourceTarget(base, dataset, src, trg) {
  const isDifferent = DIFFERENT_TESTSETS.some((k) => dataset.includes(k));

  // A) “different testsets” path via TSV mapping
  if (isDifferent) {
    const { sourcePath, refPath } = await fetchRefPairViaTsv(
      base,
      dataset,
      src,
      trg,
    );

    let sourceData = await fetchIndirectIfNeeded(base, sourcePath);
    let targetData = await fetchIndirectIfNeeded(base, refPath);

    // original branch A: pop both once
    sourceData = stripTrailingOnce(sourceData);
    targetData = stripTrailingOnce(targetData);

    return { sourceData, targetData, branch: "A" };
  }

  // B) “default” path
  const ds = dataset.includes("flores")
    ? dataset.replace("-devtest", "_dataset")
    : dataset;

  const nameForNewstest =
    dataset === "newstest2008" ? "news-test2008" : dataset;

  const srcUrl = dataset.includes("flores")
    ? `${base}/OPUS-MT-testsets/master/testsets/${ds}/devtest/${src}.devtest`
    : `${base}/OPUS-MT-testsets/master/testsets/${src}-${trg}/${nameForNewstest}.${src}`;

  const trgUrl = dataset.includes("flores")
    ? `${base}/OPUS-MT-testsets/master/testsets/${ds}/devtest/${trg}.devtest`
    : `${base}/OPUS-MT-testsets/master/testsets/${src}-${trg}/${nameForNewstest}.${trg}`;

  // fetch both, then apply “pointer file” fallback like old branch B
  const [srcText, trgText] = await Promise.all([
    fetchText(srcUrl),
    fetchText(trgUrl),
  ]);

  let sourceData = srcText.split("\n").filter((x) => x.length);
  let targetData = trgText.split("\n").filter((x) => x.length);

  if (sourceData.length === 1)
    sourceData = await fetchIndirectFromPointer(base, sourceData[0]);
  if (targetData.length === 1)
    targetData = await fetchIndirectFromPointer(base, targetData[0]);

  return { sourceData, targetData, branch: "B" };
}

function buildDiffs({
  modelType,
  modelOneData,
  modelTwoData,
  modelThreeData,
  targetData,
  hasThird,
}) {
  // mirrors your existing diff semantics
  if (modelType === "all" && hasThird) {
    return modelOneData.map((_, i) => ({
      diffOne: Diff.diffWords(modelOneData[i] ?? "", modelTwoData[i] ?? ""),
      diffTwo: Diff.diffWords(modelOneData[i] ?? "", modelThreeData[i] ?? ""),
    }));
  }

  if (modelType === "all" && !hasThird) {
    return modelOneData.map((_, i) =>
      Diff.diffWords(modelOneData[i] ?? "", modelTwoData[i] ?? ""),
    );
  }

  if (modelType === "opus") {
    return modelOneData.map((_, i) =>
      Diff.diffWords(targetData[i] ?? "", modelOneData[i] ?? ""),
    );
  }

  if (modelType === "external") {
    return modelTwoData.map((_, i) =>
      Diff.diffWords(targetData[i] ?? "", modelTwoData[i] ?? ""),
    );
  }

  if (modelType === "contributed" && hasThird) {
    return modelThreeData.map((_, i) =>
      Diff.diffWords(targetData[i] ?? "", modelThreeData[i] ?? ""),
    );
  }

  return [];
}

export default async function ComparePage({ searchParams }) {
  const params = (await searchParams) ?? {};

  // REQUIRED PARAMS (base)
  const dataset = reqParam(params, "dataset");
  const src = reqParam(params, "src");
  const trg = reqParam(params, "trg");
  const type = reqParam(params, "type");
  const m1 = reqParam(params, "m1");

  // OPTIONAL PARAMS (backwards compatible)
  const m2 = reqParam(params, "m2"); // may be null
  const m3 = reqParam(params, "m3") ?? "none"; // if missing -> none
  const from = reqParam(params, "from") ?? ""; // optional; keep as "" if missing

  if (!dataset || !src || !trg || !type || !m1) notFound();

  const modelType = String(type);
  if (!["all", "opus", "external", "contributed"].includes(modelType))
    notFound();

  const base = process.env.BASE;
  if (!base) notFound();

  const srcLang = decodeMaybe(src);
  const trgLang = decodeMaybe(trg);

  const modelOne = decodeMaybe(m1);
  const modelTwo = m2 ? decodeMaybe(m2) : "";
  const modelThree = m3 ? decodeMaybe(m3) : "none";

  // “none” means “no third model”
  const hasThird = modelThree !== "none";

  // Validate per mode:
  // - opus: requires m1
  // - external: requires m2
  // - contributed: requires m3 (not none)
  // - all: requires m1 + m2; m3 optional (none allowed)
  if (modelType === "all" && !modelTwo) notFound();
  if (modelType === "external" && !modelTwo) notFound();
  if (modelType === "contributed" && !hasThird) notFound();

  // which outputs do we actually fetch
  const want1 = modelType === "all" || modelType === "opus";
  const want2 = (modelType === "all" || modelType === "external") && !!modelTwo;
  const want3 =
    (modelType === "contributed" || (modelType === "all" && hasThird)) &&
    hasThird;

  try {
    const { sourceData, targetData, branch } = await fetchSourceTarget(
      base,
      dataset,
      srcLang,
      trgLang,
    );

    const m1Root = leaderboardRoot(modelOne);
    const m2Root = modelTwo ? leaderboardRoot(modelTwo) : "";

    const modelOneUrl = want1
      ? outputUrl(base, m1Root, modelOne, dataset, srcLang, trgLang)
      : "";

    const modelTwoUrl = want2
      ? outputUrl(base, m2Root, modelTwo, dataset, srcLang, trgLang)
      : "";

    const modelThreeUrl = want3
      ? `${base}/Contributed-MT-leaderboard/master/models/${modelThree}/${dataset}.${srcLang}-${trgLang}.output`
      : "";

    // fetch model outputs in parallel (only those needed)
    const [m1Text, m2Text, m3Text] = await Promise.all([
      fetchTextOrEmpty(modelOneUrl, want1),
      fetchTextOrEmpty(modelTwoUrl, want2),
      fetchTextOrEmpty(modelThreeUrl, want3),
    ]);

    // Preserve your branch-specific quirks
    let modelOneData = [];
    let modelTwoData = [];
    let modelThreeData = [];

    if (want1) {
      modelOneData =
        branch === "B"
          ? m1Text.split("\n").filter((x) => x.length)
          : splitLinesRaw(m1Text);
    }

    if (want2) {
      modelTwoData =
        branch === "B"
          ? m2Text.split("\n").filter((x) => x.length)
          : splitLinesRaw(m2Text);
    }

    if (want3) {
      modelThreeData = splitLinesRaw(m3Text);
    }

    // replicate the “pop” behavior from your original code
    if (branch === "A") {
      if (want1 && modelOneData.length) modelOneData.pop();
      if (want2 && modelTwoData.length) modelTwoData.pop();
    } else {
      if (want1 && modelOneData.length) modelOneData.pop();
      if (want2 && modelTwoData.length) modelTwoData.pop();
      // source/target were filtered in branch B, no pop
    }

    const allDiff = buildDiffs({
      modelType,
      modelOneData,
      modelTwoData,
      modelThreeData,
      targetData,
      hasThird: want3,
    });

    // old code often popped allDiff once
    if (Array.isArray(allDiff) && allDiff.length) allDiff.pop();

    const languages = codeToLangTransformer([srcLang, trgLang]);

    return (
      <CompareClient
        dataset={dataset}
        languages={languages}
        sourceData={sourceData}
        targetData={targetData}
        modelType={modelType}
        modelOne={modelOne}
        modelTwo={modelTwo}
        modelThree={hasThird ? modelThree : ""}
        modelOneUrl={modelOneUrl}
        modelTwoUrl={modelTwoUrl}
        modelThreeUrl={modelThreeUrl}
        modelOneData={modelOneData}
        modelTwoData={modelTwoData}
        modelThreeData={want3 ? modelThreeData : null}
        allDiff={allDiff}
        from={from}
      />
    );
  } catch {
    const languages = codeToLangTransformer([srcLang, trgLang]);
    return (
      <CompareClient
        dataset={dataset}
        languages={languages}
        sourceData={[]}
        targetData={[]}
        modelType={modelType}
        modelOne={modelOne}
        modelTwo={modelTwo}
        modelThree={hasThird ? modelThree : ""}
        modelOneUrl=""
        modelTwoUrl=""
        modelThreeUrl=""
        modelOneData={[]}
        modelTwoData={[]}
        modelThreeData={null}
        allDiff={[]}
        from={from}
        notFound
      />
    );
  }
}
