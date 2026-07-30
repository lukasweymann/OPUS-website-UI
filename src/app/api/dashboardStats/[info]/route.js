import { NextResponse } from "next/server";
import {
  getMaxValues,
  getAvgValues,
  getScoresByModel,
  getScoresByTestset,
} from "@/lib/scoresQueries";
import { numberFormatter } from "../../../../../hooks/hooks";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const toNum = (v) => +v || 0;

function json(data, status = 200) {
  return NextResponse.json(data, { status });
}

function legacyNotFound() {
  return json(404);
}

function methodNotAllowed() {
  return json({ error: "Method not allowed" }, 405);
}

function decodeParam(value = "") {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

const parseInfo = (info = "") => {
  const [originValue, targetValue, scoreValue, benchmarkValue, modelType] =
    String(info).split("&");
  return { originValue, targetValue, scoreValue, benchmarkValue, modelType };
};

const fetchTextOrFalse = async (url) => {
  try {
    const r = await fetch(url, { cache: "no-store" });
    if (!r.ok) return false;
    return await r.text();
  } catch {
    return false;
  }
};

const parseModelSizeText = (t = "") => t.split("\n").map((r) => r.split("\t"));

const modelSizeToNum = (cell) => {
  if (!cell) return null;
  const n = parseFloat(String(cell).replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n * 1_000_000 : null;
};

const makeSizeMap = (...tables) => {
  const m = new Map();
  for (const t of tables) {
    if (!Array.isArray(t)) continue;
    for (const s of t) {
      const model = s?.[0];
      if (!model) continue;
      const sz = modelSizeToNum(s?.[2]);
      if (sz != null) m.set(model, sz);
    }
  }
  return m;
};

const attachSizesFromMap = (rows = [], sizeMap) => {
  if (!sizeMap?.size) return rows;
  for (const r of rows) {
    const sz = sizeMap.get(r.model);
    if (sz != null) r.size = sz;
  }
  return rows;
};

const joinBy = (targetRows, sourceRows, key, prop) => {
  if (!sourceRows?.length) return targetRows;
  const map = new Map(sourceRows.map((x) => [x[key], x]));
  for (const t of targetRows) {
    const hit = map.get(t[key]);
    if (hit) t[prop] = hit;
  }
  return targetRows;
};

const sumCount = (rows, get, pred = () => true) => {
  let sum = 0;
  let count = 0;
  for (const r of rows || []) {
    if (!pred(r)) continue;
    sum += toNum(get(r));
    count++;
  }
  return { sum, count, avg: count ? sum / count : 0 };
};

const catalogFromModelType = (modelType) =>
  modelType === "opus"
    ? "OPUS"
    : modelType === "external"
      ? "External"
      : "Contributed";

export async function GET(_req, { params }) {
  try {
    const routeParams = await params;
    const { originValue, targetValue, scoreValue, benchmarkValue, modelType } =
      parseInfo(routeParams?.info ? decodeParam(routeParams.info) : "");

    const langpair = `${originValue}-${targetValue}`;
    const base = process.env.BASE;

    const [includedTxt, externalTxt] = await Promise.all([
      fetchTextOrFalse(`${base}/OPUS-MT-leaderboard/master/models/modelsize.txt`),
      fetchTextOrFalse(`${base}/External-MT-leaderboard/master/models/modelsize.txt`),
    ]);

    const modelSizesIncluded = includedTxt
      ? parseModelSizeText(includedTxt)
      : false;
    const modelSizesExternal = externalTxt
      ? parseModelSizeText(externalTxt)
      : false;

    const sizeMap = makeSizeMap(modelSizesIncluded, modelSizesExternal);

    if (benchmarkValue === "all" && modelType === "all") {
      const [opusResult, externalResult, contributedResult] = await Promise.all([
        getMaxValues(langpair, scoreValue, "OPUS"),
        getMaxValues(langpair, scoreValue, "External"),
        getMaxValues(langpair, scoreValue, "Contributed"),
      ]);

      attachSizesFromMap(opusResult, makeSizeMap(modelSizesIncluded));
      attachSizesFromMap(externalResult, makeSizeMap(modelSizesExternal));

      joinBy(opusResult, externalResult, "testset", "external");
      if (contributedResult?.length) {
        joinBy(opusResult, contributedResult, "testset", "contributed");
      }

      const opusAvgScore = sumCount(opusResult, (x) => x.score).avg;

      const externalOnOpus = sumCount(
        opusResult,
        (x) => x.external?.score,
        (x) => !!x.external,
      );
      const externalAvgScore = externalOnOpus.avg;

      const opusSizeAvg = sumCount(
        opusResult,
        (x) => x.size,
        (x) => !!x.size,
      ).avg;
      const externalSizeAvg = sumCount(
        externalResult,
        (x) => x.size,
        (x) => !!x.size,
      ).avg;

      const diffScoreAvg =
        sumCount(
          opusResult,
          (x) => toNum(x.score) - toNum(x.external?.score),
          (x) => !!x.external,
        ).avg - 1;

      return json({
        cleanData: opusResult,
        opusAvgScore,
        externalAvgScore,
        opusSizeAvg,
        externalSizeAvg,
        diffScoreAvg,
      });
    }

    if (
      benchmarkValue === "all" &&
      (modelType === "opus" ||
        modelType === "external" ||
        modelType === "contributed")
    ) {
      const catalog = catalogFromModelType(modelType);
      const result = await getMaxValues(langpair, scoreValue, catalog);

      attachSizesFromMap(result, sizeMap);

      return json({
        cleanData: result,
        avgScore: sumCount(result, (x) => x.score).avg,
        avgSize: sumCount(result, (x) => x.size, (x) => !!x.size).avg,
      });
    }

    if (benchmarkValue === "avg") {
      const avgValues = await getAvgValues(langpair, scoreValue);

      attachSizesFromMap(avgValues, sizeMap);
      for (const el of avgValues || []) el.score = parseFloat(el?._avg?.score);

      const scoreAvg = sumCount(avgValues, (x) => x.score).avg;

      const opus = sumCount(
        avgValues,
        (x) => x.score,
        (x) => x.catalog === "OPUS",
      ).avg;
      const ext = sumCount(
        avgValues,
        (x) => x.score,
        (x) => x.catalog === "External",
      ).avg;

      const sizeAvg = sumCount(avgValues, (x) => x.size, (x) => !!x.size).avg;
      const opusSizeAvg = sumCount(
        avgValues,
        (x) => x.size,
        (x) => !!x.size && x.catalog === "OPUS",
      ).avg;
      const externalSizeAvg = sumCount(
        avgValues,
        (x) => x.size,
        (x) => !!x.size && x.catalog === "External",
      ).avg;

      return json({
        cleanData: avgValues,
        scoreAvg: scoreAvg.toFixed(2),
        opusScoreAvg: +opus.toFixed(2),
        externalScoreAvg: +ext.toFixed(2),
        sizeAvg: sizeAvg && numberFormatter(sizeAvg),
        opusSizeAvg: opusSizeAvg && numberFormatter(opusSizeAvg),
        externalSizeAvg: externalSizeAvg && numberFormatter(externalSizeAvg),
      });
    }

    if (
      benchmarkValue !== "avg" &&
      benchmarkValue !== "all" &&
      benchmarkValue !== "none"
    ) {
      const benchmarkResults = await getScoresByTestset({
        langpair,
        scoreValue,
        benchmarkValue,
      });

      for (const item of benchmarkResults || []) {
        const sz = sizeMap.get(item.model);
        item.size = sz != null ? sz : "";
      }

      const avgScore = sumCount(benchmarkResults, (x) => x.score).avg;
      const opusAvgScore = sumCount(
        benchmarkResults,
        (x) => x.score,
        (x) => x.catalog === "OPUS",
      ).avg;
      const externalAvgScore = sumCount(
        benchmarkResults,
        (x) => x.score,
        (x) => x.catalog === "External",
      ).avg;

      const allSizesAvg = sumCount(
        benchmarkResults,
        (x) => x.size,
        (x) => !!x.size,
      ).avg;
      const opusSizesAvg = sumCount(
        benchmarkResults,
        (x) => x.size,
        (x) => !!x.size && x.catalog === "OPUS",
      ).avg;
      const externalSizesAvg = sumCount(
        benchmarkResults,
        (x) => x.size,
        (x) => !!x.size && x.catalog === "External",
      ).avg;

      return json({
        cleanData: benchmarkResults,
        avgScore,
        opusAvgScore,
        externalAvgScore,
        allSizesAvg,
        opusSizesAvg,
        externalSizesAvg,
      });
    }

    if (
      modelType !== "all" &&
      modelType !== "opus" &&
      modelType !== "external" &&
      modelType !== "contributed"
    ) {
      const scoresByModel = await getScoresByModel(
        langpair,
        scoreValue,
        modelType,
      );
      if (!scoresByModel?.length) return legacyNotFound();

      const avgScore = sumCount(scoresByModel, (x) => x.score).avg;
      return json({
        cleanData: scoresByModel,
        avgScore: +avgScore.toFixed(2),
      });
    }

    return legacyNotFound();
  } catch {
    return legacyNotFound();
  }
}

export const POST = methodNotAllowed;
export const PUT = methodNotAllowed;
export const PATCH = methodNotAllowed;
export const DELETE = methodNotAllowed;
