import { NextResponse } from "next/server";
import { callScoresApi } from "@/lib/scoresApiClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(data, status = 200) {
  return NextResponse.json(data, { status });
}

function decodeParam(value = "") {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function parseInfo(info) {
  if (!info || typeof info !== "string") {
    return {
      error: "Missing or invalid 'info' query param",
    };
  }

  const [modelOne, modelTwo, origin, target, scoreType] = info.split("&");

  if (!modelOne || !modelTwo || !origin || !target || !scoreType) {
    return {
      error: "Expected 'info' format: modelOne&modelTwo&origin&target&scoreType",
    };
  }

  return { modelOne, modelTwo, origin, target, scoreType };
}

async function handler(_req, { params }) {
  try {
    const routeParams = await params;
    const parsed = parseInfo(
      routeParams?.info ? decodeParam(routeParams.info) : "",
    );

    if (parsed.error) {
      return json({ error: parsed.error }, 400);
    }

    const { modelOne, modelTwo, origin, target, scoreType } = parsed;
    const langpair = `${origin}-${target}`;
    const catalogOne = modelOne.includes("huggingface") ? "External" : "OPUS";
    const catalogTwo = modelTwo.includes("huggingface") ? "External" : "OPUS";

    const [modelOneRes, modelTwoRes] = await Promise.all([
      callScoresApi("scores", {
        langpair,
        score_type: scoreType,
        catalog: catalogOne,
        model: modelOne,
      }),
      callScoresApi("scores", {
        langpair,
        score_type: scoreType,
        catalog: catalogTwo,
        model: modelTwo,
      }),
    ]);

    const modelOneScores = Array.isArray(modelOneRes?.items)
      ? modelOneRes.items
      : [];
    const modelTwoScores = Array.isArray(modelTwoRes?.items)
      ? modelTwoRes.items
      : [];

    const scores1ByTestset = new Map(
      modelOneScores.map((s) => [s.testset, s.score]),
    );
    const scores2ByTestset = new Map(
      modelTwoScores.map((s) => [s.testset, s.score]),
    );

    const mixedData = [];

    for (const [testset, scoreOneRaw] of scores1ByTestset.entries()) {
      if (!scores2ByTestset.has(testset)) continue;

      const scoreTwoRaw = scores2ByTestset.get(testset);
      const scoreOneNum = Number(scoreOneRaw);
      const scoreTwoNum = Number(scoreTwoRaw);

      mixedData.push({
        benchmark: testset,
        scoreOne: scoreOneNum,
        scoreTwo: scoreTwoNum,
        diffScore: Number((scoreOneNum - scoreTwoNum).toFixed(2)),
      });
    }

    if (!mixedData.length) {
      return json({
        tableData: [],
        modelOneScoreAvg: null,
        modelTwoScoreAvg: null,
        diffAvg: null,
      });
    }

    const sumField = (arr, field) =>
      arr.reduce((acc, row) => acc + Number(row[field] ?? 0), 0);

    const modelOneScoreAvg = sumField(mixedData, "scoreOne") / mixedData.length;
    const modelTwoScoreAvg = sumField(mixedData, "scoreTwo") / mixedData.length;
    const diffAvg = sumField(mixedData, "diffScore") / mixedData.length;

    return json({
      tableData: mixedData,
      modelOneScoreAvg: modelOneScoreAvg.toFixed(2),
      modelTwoScoreAvg: modelTwoScoreAvg.toFixed(2),
      diffAvg: diffAvg.toFixed(2),
    });
  } catch (error) {
    console.error("fetchTableModelData error:", error);
    return json({ error: "Internal server error" }, 500);
  }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
