import { getDistinctModels } from "@/lib/scoresQueries";

export default function getModelList(req, res) {
  const langpair = req.query.info.split("&");

  const originLang = langpair[0];
  const targetLang = langpair[1];

  async function modelList() {
    try {
      const distinctModels = await getDistinctModels(
        `${originLang}-${targetLang}`
      );

      res.send(distinctModels);
    } catch (err) {
      return res.send(404);
    }
  }

  modelList();
}
