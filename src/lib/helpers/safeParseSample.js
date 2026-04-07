export function safeParseSample(html) {
    if (!html || typeof html !== "string") {
        return { sampleData: [], secondModality: false };
    }

    const secondModality = html.includes("src") ? false : true;

    const raw1 = html.split("<hr>").slice(1, -1).filter(Boolean);

    const normalized = html.replaceAll("<br/>", "<br>");
    const pSplit = normalized.split("<p>");
    const afterP = pSplit.length > 1 ? pSplit[1] : "";
    const raw2 = afterP.split("<hr/>").slice(1, -1).filter(Boolean);

    const cleanChunkList = (arr) =>
        arr
            .map((s) => String(s).replace("\n", ""))
            .filter((s) => s && !s.includes("#"));

    const c1 = cleanChunkList(raw1);
    const c2 = cleanChunkList(raw2);

    const sampleData = c1.length > 1 ? c1 : c2;

    return { sampleData, secondModality };
}