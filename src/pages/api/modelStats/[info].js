export default function languagePairs(req, res) {
	const axios = require("axios");
	const originValue = req.query.info.split("&")[0];
	const targetValue = req.query.info.split("&")[1];
	const scoreValue = req.query.info.split("&")[2];
	const benchmarkValue = req.query.info.split("&")[3];
	const contributed = req.query.info.split("&")[4];

	async function getDashboardStats() {
		const repo = process.env.BASE;
		let modelSizesIncluded;

		if (benchmarkValue === "none") {
			try {
				const opusRes = await axios.get(
					`${repo}OPUS-MT-leaderboard/master/scores/${originValue}-${targetValue}/${benchmarkValue}/${scoreValue}-scores.txt`
				);

				const opusData = opusRes.data.split("\n").map((r) => r.split("\t"));

				if (modelSizesIncluded) {
					opusData.forEach((model) => {
						modelSizesIncluded.forEach((size) => {
							if (
								model[1] &&
								size[0].includes(
									model[1].replace("https://huggingface.co/HPLT/", "")
								)
							) {
								model.push(size[1]);
							}
							if (model[1] && model[1].includes(size[0])) {
								model.push(size[1]);
							}
						});
					});
				}

				const externalRes = await axios.get(
					`${repo}External-MT-leaderboard/master/scores/${originValue}-${targetValue}/${benchmarkValue}/${scoreValue}-scores.txt`
				);

				let contributedData = [];
				let contributedNotFound = false;

				if (contributed === "contributed") {
					try {
						const contributedRes = await axios.get(
							`${repo}Contributed-MT-leaderboard/master/scores/${originValue}-${targetValue}/${benchmarkValue}/${scoreValue}-scores.txt`
						);

						const contributedResponse = contributedRes.data
							.split("\n")
							.map((r) => r.split("\t"));

						contributedData = contributedResponse;
					} catch (err) {
						contributedNotFound = true;
					}
				}

				const externalData = externalRes.data
					.split("\n")
					.map((r) => r.split("\t"));

				await opusData.forEach((corpusName) => {
					corpusName.push("opus");
				});

				await externalData.forEach((corpusName) => {
					corpusName.push("external");
				});
				if (opusData.length && externalData.length) {
					opusData.concat(externalData);
				}

				if (opusData && modelSizesExternal) {
					opusData.forEach((model) => {
						modelSizesExternal.forEach((size) => {
							if (
								model.external &&
								model.external[1] &&
								size[0] &&
								model.external[1].includes(size[0])
							) {
								model.external.push(size[2]);
							}
						});
					});
				}

				if (contributedData.length > 0) {
					contributedData.pop();

					await opusData.forEach((corpusName) => {
						contributedData.forEach((corpus) => {
							if (corpusName[0] == corpus[0]) {
								return (corpusName.contributed = corpus);
							} else {
								return corpusName;
							}
						});
					});
				}

				const prevData = opusData.map((corpus, idx) => {
					return {
						testSet: idx,
						corpusName: corpus[0],
						bleuScore: +parseFloat(corpus[1]).toFixed(2),
						opusScore: +parseFloat(corpus[1]).toFixed(2),
						hpltScore: corpus[2] && corpus[2].includes("hplt"),
						link: corpus[2],
						size: corpus[3],
						numericSize: corpus[3]
							? parseFloat(corpus[3].replace(/[^\d.-]/g, "")) * 1000000
							: "",
						externalSize:
							corpus.external && corpus.external[3] ? corpus.external[3] : "",
						externalNumericSize:
							corpus.external && corpus.external[3]
								? parseFloat(corpus.external[3].replace(/[^\d.-]/g, "")) *
								1000000
								: "",
						external: corpus.external ? corpus.external : "",
						externalScore: corpus.external
							? +parseFloat(corpus.external[1]).toFixed(2)
							: null,
						contributedScore: corpus.contributed
							? +parseFloat(corpus.contributed[1]).toFixed(2)
							: null,
						contributed: corpus.contributed ? corpus.contributed : "",
					};
				});

				const mixedData = prevData.filter(
					(item) =>
						item.corpusName !== "news2008" &&
						item.corpusName !== "news-test2008"
				);

				const cleanData = mixedData.filter((data) => data.corpusName);

				const externalLength = cleanData.filter((item) => item.external);

				const opusAvgScore =
					opusData.reduce((a, b) => {
						return a + +b[1];
					}, 0) / opusData.length;

				const externalAvgScore =
					cleanData
						.filter((item) => item.external)
						.reduce((a, b) => {
							return a + +b.external[1];
						}, 0) / externalLength.length;

				const allOpusSizes = cleanData.filter((e) => e.numericSize);

				const sizeAvg =
					cleanData
						.filter((item) => item.numericSize)
						.reduce((a, b) => {
							return a + +b.numericSize;
						}, 0) / allOpusSizes.length;

				const allExternalSizes = cleanData.filter((e) => e.externalNumericSize);

				const externalSizeAvg =
					cleanData
						.filter((item) => item.externalNumericSize)
						.reduce((a, b) => {
							return a + +b.externalNumericSize;
						}, 0) / allExternalSizes.length;

				const diffScore =
					cleanData
						.filter((item) => item.external)
						.reduce((a, b) => {
							return a + (+b.bleuScore - +b.external[1]);
						}, 0) /
					externalLength.length +
					1;

				const entireResponse = {
					cleanData: cleanData,
					opusAvgScore: opusAvgScore,
					externalAvgScore: externalAvgScore,
					diffScore: diffScore,
					contributedNotFound: contributedNotFound,
					sizeAvg: sizeAvg,
					externalSizeAvg: externalSizeAvg,
				};

				res.send(entireResponse);
			} catch (error) {
				console.log(error);
				return res.send(404);
			}
		}
	}

	getDashboardStats();
}
