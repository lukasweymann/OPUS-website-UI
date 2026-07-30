// app/api/dashboard-stats/[info]/route.js
import { NextResponse } from "next/server";
import {
    getMaxValues,
    getAvgValues,
    getScoresByModel,
    getScoresByTestset,
} from "@/lib/scoresQueries";
import { numberFormatter } from "../../../../../hooks/hooks";

export const dynamic = "force-dynamic"; // you were using cache:no-store before

const MILLION = 1_000_000;

function badRequest(msg) {
    return NextResponse.json({ error: msg }, { status: 400 });
}

function notFound(msg = "Not found") {
    return NextResponse.json({ error: msg }, { status: 404 });
}

function ok(data) {
    return NextResponse.json(data, { status: 200 });
}

function decodeParam(value = "") {
    try {
        return decodeURIComponent(value);
    } catch {
        return value;
    }
}

function safeAvg(arr, pick = (x) => x, digits) {
    const vals = (arr || []).map(pick).map(Number).filter((n) => Number.isFinite(n));
    if (!vals.length) return null;
    const v = vals.reduce((a, b) => a + b, 0) / vals.length;
    return typeof digits === "number" ? Number(v.toFixed(digits)) : v;
}

function parseSizeToNumberMillion(txt) {
    // your old code did parseFloat(size[2].replace(/[^\d.-]/g, "")) * 1000000
    const raw = String(txt ?? "").replace(/[^\d.-]/g, "");
    const n = Number.parseFloat(raw);
    return Number.isFinite(n) ? n * MILLION : null;
}

async function fetchModelSizeMap(url) {
    try {
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) return new Map();
        const text = await res.text();
        const map = new Map();

        text
            .split("\n")
            .map((r) => r.split("\t"))
            .forEach((row) => {
                const model = row?.[0];
                const sizeTxt = row?.[2];
                if (!model) return;
                const size = parseSizeToNumberMillion(sizeTxt);
                if (size) map.set(model, size);
            });

        return map;
    } catch {
        return new Map();
    }
}

function attachSizes(rows, sizeMap) {
    if (!Array.isArray(rows) || !sizeMap?.size) return rows;
    for (const r of rows) {
        const s = sizeMap.get(r?.model);
        if (s) r.size = s;
    }
    return rows;
}

function mapModelTypeToCatalog(modelType) {
    // modelType is your URL param: all|opus|external|contributed OR actual model name
    if (modelType === "opus") return "OPUS";
    if (modelType === "external") return "External";
    if (modelType === "contributed") return "Contributed";
    return null; // means: not a catalog, likely a concrete model name
}

export async function GET(_req, { params }) {

    const routeParams = await params;
    const info = routeParams?.info ? decodeParam(routeParams.info) : "";
    const parts = info.split("&");

    // origin&target&score&benchmark&modelType
    const [originValue, targetValue, scoreValue, benchmarkValue, modelTypeRaw] =
        parts;

    if (!originValue || !targetValue || !scoreValue || !benchmarkValue || !modelTypeRaw) {
        return badRequest(
            "Expected /api/dashboard-stats/{origin&target&score&benchmark&modelType}"
        );
    }

    const modelType = modelTypeRaw; // keep as-is (may contain %2F already)

    const base = process.env.BASE;
    if (!base) return badRequest("Missing BASE env var");

    const langpair = `${originValue}-${targetValue}`;

    // Fetch model-size maps in parallel (non-fatal if missing)
    const [opusSizeMap, externalSizeMap] = await Promise.all([
        fetchModelSizeMap(`${base}/OPUS-MT-leaderboard/hplt/models/modelsize.txt`),
        fetchModelSizeMap(`${base}/External-MT-leaderboard/master/models/modelsize.txt`),
    ]);

    // Merge maps (external overwrites opus if collision; acceptable)
    const allSizeMap = new Map([...opusSizeMap.entries(), ...externalSizeMap.entries()]);

    try {
        /**
         * 1) TOP scores (benchmark=all, modelType=all)
         */
        if (benchmarkValue === "all" && modelType === "all") {
            const [opusResult, externalResult, contributedResult] = await Promise.all([
                getMaxValues(langpair, scoreValue, "OPUS"),
                getMaxValues(langpair, scoreValue, "External"),
                getMaxValues(langpair, scoreValue, "Contributed"),
            ]);

            attachSizes(opusResult, opusSizeMap);
            attachSizes(externalResult, externalSizeMap);

            // Join external/contributed into opus rows by testset (O(n))
            const extByTestset = new Map(
                (externalResult || []).map((x) => [x?.testset, x])
            );
            const contrByTestset = new Map(
                (contributedResult || []).map((x) => [x?.testset, x])
            );

            for (const row of opusResult || []) {
                const t = row?.testset;
                if (t && extByTestset.has(t)) row.external = extByTestset.get(t);
                if (t && contrByTestset.has(t)) row.contributed = contrByTestset.get(t);
            }

            const externalRowsPresent = (opusResult || []).filter((r) => r?.external);

            const opusAvgScore = safeAvg(opusResult, (x) => x?.score);
            const externalAvgScore = safeAvg(externalRowsPresent, (x) => x?.external?.score);

            const opusSizeAvg = safeAvg(
                (opusResult || []).filter((x) => x?.size),
                (x) => x?.size
            );
            const externalSizeAvg = safeAvg(
                (externalResult || []).filter((x) => x?.size),
                (x) => x?.size
            );

            // Your old logic: avg(score - external.score) / count - 1 (kept)
            const diffScoreAvgRaw = safeAvg(
                externalRowsPresent,
                (x) => Number(x?.score) - Number(x?.external?.score)
            );
            const diffScoreAvg = diffScoreAvgRaw == null ? null : diffScoreAvgRaw - 1;

            return ok({
                cleanData: opusResult || [],
                opusAvgScore,
                externalAvgScore,
                opusSizeAvg,
                externalSizeAvg,
                diffScoreAvg,
            });
        }

        /**
         * 2) TOP scores for a single catalog (benchmark=all, modelType in opus|external|contributed)
         */
        if (
            benchmarkValue === "all" &&
            (modelType === "opus" || modelType === "external" || modelType === "contributed")
        ) {
            const catalog = mapModelTypeToCatalog(modelType);
            const result = await getMaxValues(langpair, scoreValue, catalog);

            attachSizes(result, allSizeMap);

            const avgScore = safeAvg(result, (x) => x?.score);
            const avgSize = safeAvg(
                (result || []).filter((x) => x?.size),
                (x) => x?.size
            );

            return ok({
                cleanData: result || [],
                avgScore,
                avgSize,
            });
        }

        /**
         * 3) Average scores (benchmark=avg)
         */
        if (benchmarkValue === "avg") {
            const avgValues = await getAvgValues(langpair, scoreValue);
            const rows = Array.isArray(avgValues) ? avgValues : [];

            attachSizes(rows, allSizeMap);

            // Preserve your behavior: score = _avg.score
            for (const el of rows) {
                if (el?._avg?.score != null) el.score = Number.parseFloat(el._avg.score);
            }

            const scoreAvg = safeAvg(rows, (x) => x?.score, 2);

            const opusRows = rows.filter((x) => x?.catalog === "OPUS");
            const extRows = rows.filter((x) => x?.catalog === "External");

            const opusScoreAvg = safeAvg(opusRows, (x) => x?.score, 2);
            const externalScoreAvg = safeAvg(extRows, (x) => x?.score, 2);

            const sized = rows.filter((x) => x?.size);

            const sizeAvg = safeAvg(sized, (x) => x?.size);
            const opusSizeAvg = safeAvg(sized.filter((x) => x?.catalog === "OPUS"), (x) => x?.size);
            const externalSizeAvg = safeAvg(
                sized.filter((x) => x?.catalog === "External"),
                (x) => x?.size
            );

            return ok({
                cleanData: rows,
                scoreAvg,
                opusScoreAvg,
                externalScoreAvg,
                sizeAvg: sizeAvg && numberFormatter(sizeAvg),
                opusSizeAvg: opusSizeAvg && numberFormatter(opusSizeAvg),
                externalSizeAvg: externalSizeAvg && numberFormatter(externalSizeAvg),
            });
        }

        /**
         * 4) Scores by one benchmark (benchmark is a testset)
         */
        if (benchmarkValue !== "avg" && benchmarkValue !== "all" && benchmarkValue !== "none") {
            const benchmarkResults = await getScoresByTestset({
                langpair,
                scoreValue,
                benchmarkValue,
            });

            const rows = Array.isArray(benchmarkResults) ? benchmarkResults : [];
            attachSizes(rows, allSizeMap);

            const opusRows = rows.filter((x) => x?.catalog === "OPUS");
            const extRows = rows.filter((x) => x?.catalog === "External");

            const avgScore = safeAvg(rows, (x) => x?.score);
            const opusAvgScore = safeAvg(opusRows, (x) => x?.score);
            const externalAvgScore = safeAvg(extRows, (x) => x?.score);

            const allSizesAvg = safeAvg(rows.filter((x) => x?.size), (x) => x?.size);
            const opusSizesAvg = safeAvg(opusRows.filter((x) => x?.size), (x) => x?.size);
            const externalSizesAvg = safeAvg(extRows.filter((x) => x?.size), (x) => x?.size);

            return ok({
                cleanData: rows,
                avgScore,
                opusAvgScore,
                externalAvgScore,
                allSizesAvg,
                opusSizesAvg,
                externalSizesAvg,
            });
        }

        /**
         * 5) Benchmarks for one model (benchmark=none, modelType is a concrete model name)
         * Your old code triggered this when modelType is not in the known set.
         */
        const catalogForModelType = mapModelTypeToCatalog(modelType);
        const isConcreteModel =
            modelType !== "all" && catalogForModelType == null && modelType !== "";

        if (isConcreteModel) {
            const scoresByModel = await getScoresByModel(langpair, scoreValue, modelType);
            const rows = Array.isArray(scoresByModel) ? scoresByModel : [];

            if (!rows.length) return notFound("No results for this model");

            const avgScore = safeAvg(rows, (x) => x?.score, 2);

            return ok({
                cleanData: rows,
                avgScore,
            });
        }

        return notFound("No matching mode for given parameters");
    } catch (e) {
        // keep non-breaking behavior: old code returned 404 on any failure
        return notFound("Failed to compute dashboard stats");
    }
}
