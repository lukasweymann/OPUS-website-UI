import { callScoresApi } from "@/lib/scoresApiClient";

function formatScore(score, scoreType) {
    if (score == null) return null;
    const num = Number(score);
    if (Number.isNaN(num)) return null;

    if (scoreType === "bleu" || scoreType === "spbleu") {
        return Number(num.toFixed(1));
    }
    return num;
}

/**
 * getMaxValues(langpair, scoreType, catalog)
 * Replacement for the Prisma groupBy + findFirst combination.
 */
export async function getMaxValues(langpair, scoreType, catalog) {
    const res = await callScoresApi("maxByTestset", {
        langpair,
        score_type: scoreType,
        catalog,
    });

    const items = Array.isArray(res.items) ? res.items : [];

    const opusResult = items.map((item, idx) => ({
        score: formatScore(item.score, scoreType),
        testset: item.testset,
        model: item.model,
        catalog: item.catalog,
        idx,
    }));

    return opusResult;
}

/**
 * getAvgValues(langpair, scoreType)
 * Replacement for three groupBy+_avg queries (OPUS/External/Contributed).
 */
export async function getAvgValues(langpair, scoreType) {
    const res = await callScoresApi("avgByModel", {
        langpair,
        score_type: scoreType,
    });

    const items = Array.isArray(res.items) ? res.items : [];

    // Mimic the original shape (with _avg.score) so downstream code can stay the same
    const finalResponse = items
        .map((row) => ({
            model: row.model,
            catalog: row.catalog,
            _avg: { score: Number(row.avg_score) },
        }))
        .sort((a, b) => b._avg.score - a._avg.score);

    finalResponse.forEach((el, idx) => {
        el.idx = idx;
    });

    return finalResponse;
}

/**
 * getScoresByTestset({ langpair, scoreValue, benchmarkValue })
 */
export async function getScoresByTestset({ langpair, scoreValue, benchmarkValue }) {
    const res = await callScoresApi("scoresByTestset", {
        langpair,
        score_type: scoreValue,
        testset: benchmarkValue,
    });

    const items = Array.isArray(res.items) ? res.items : [];

    items.forEach((el, idx) => {
        el.idx = idx;
    });

    return items;
}

/**
 * getScoresByModel(langpair, scoreValue, model)
 */
export async function getScoresByModel(langpair, scoreValue, model) {
    const res = await callScoresApi("scoresByModel", {
        langpair,
        score_type: scoreValue,
        model,
    });

    const items = Array.isArray(res.items) ? res.items : [];

    items.forEach((el, idx) => {
        el.id = idx;
    });

    return items;
}

/**
 * getDistinctModels(langpair)
 */
export async function getDistinctModels(langpair) {
    const res = await callScoresApi("distinctModels", {
        langpair,
    });

    const models = Array.isArray(res.models) ? res.models : [];

    return models.map((model, idx) => ({
        model,
        id: idx,
    }));
}
