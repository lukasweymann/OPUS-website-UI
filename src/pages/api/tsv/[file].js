export default async function handler(req, res) {

  const params = req.query.file.split("&");
  const src = params[0].replace("-", "_");
  const trg = params[1].replace("-", "_");
  const version = params[2];
  const name = params[3];

  const base = process.env.BASE_REPO;

  const firstLangPair = `${src}-${trg}`;
  const secondLangPair = `${trg}-${src}`;

  try {
    if (!base) {
      return res.status(500).json({
        success: false,
        error: 'Report repository URL not configured'
      });
    }

    const response = await fetch(
      `${base}/corpus/${name}/${version}/overlaps/${firstLangPair}.tsv`
    );
    if (response.status === 200) {
      const data = await response.text();
      const values = { values: data.split("\n") };
      res.status(200).json(values)
    }

    const fallbackResponse = await fetch(
      `${base}/${name}/${version}/overlaps/${secondLangPair}.tsv`
    );
    if (fallbackResponse.status === 200) {
      const data = await fallbackResponse.text();
      const values = { values: data.split("\n") };
      res.status(200).json(values)
    }

  } catch (error) {
    console.error("No overlap data found", error)
    res.status(404)
  }

}
