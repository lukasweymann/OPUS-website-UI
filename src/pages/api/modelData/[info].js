import { callScoresApi } from "@/lib/scoresApiClient";

export default async function fetchTableModelData(req, res) {
	try {
		const info = req.query.info;
		if (!info || typeof info !== "string") {
			return res.status(400).json({ error: "Missing or invalid 'info' query param" });
		}

		const query = info.split("&");
		const [modelOne, modelTwo, origin, target, scoreType] = query;

		if (!modelOne || !modelTwo || !origin || !target || !scoreType) {
			return res.status(400).json({
				error: "Expected 'info' format: modelOne&modelTwo&origin&target&scoreType",
			});
		}

		const langpair = `${origin}-${target}`;
		const catalogOne = modelOne.includes("huggingface") ? "External" : "OPUS";
		const catalogTwo = modelTwo.includes("huggingface") ? "External" : "OPUS";

		// Fetch scores for each model via the Python-backed scores API
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

		const modelOneScores = Array.isArray(modelOneRes?.items) ? modelOneRes.items : [];
		const modelTwoScores = Array.isArray(modelTwoRes?.items) ? modelTwoRes.items : [];

		// Build maps keyed by testset for O(n + m) matching
		const scores1ByTestset = new Map(
			modelOneScores.map((s) => [s.testset, s.score])
		);
		const scores2ByTestset = new Map(
			modelTwoScores.map((s) => [s.testset, s.score])
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
			return res.status(200).json({
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

		const response = {
			tableData: mixedData,
			modelOneScoreAvg: modelOneScoreAvg.toFixed(2),
			modelTwoScoreAvg: modelTwoScoreAvg.toFixed(2),
			diffAvg: diffAvg.toFixed(2),
		};

		return res.status(200).json(response);
	} catch (error) {
		console.error("fetchTableModelData error:", error);
		return res.status(500).json({ error: "Internal server error" });
	}
}
