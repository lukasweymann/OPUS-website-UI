import { callPythonReadData } from "@/lib/pythonClient";

function makeCorpusPredicate(type) {
    const banned = new Set([
        "komi",
        "mpc1",
        "un",
        "elra-w0245",
        "elra-w0248",
        "elrc_416",
    ]);

    return function predicate(corpus) {
        const name = (corpus || "").toLowerCase();
        const hasElra = name.includes("elra");
        const hasElrc = name.includes("elrc");

        const typeOk =
            type === "elra"
                ? hasElra && !hasElrc
                : type === "elrc"
                    ? !hasElra && hasElrc
                    : !hasElra && !hasElrc;

        return typeOk && !banned.has(name);
    };
}
import corpora from "./corporaList";

export async function CorporaList(isMain, type) {

    const corporaResponse = await callPythonReadData({ corpora: "True" });

    const filteredCorpora = corporaResponse.corpora.filter(makeCorpusPredicate(type));

    const corporaListUpdated = filteredCorpora.map((corpus) => {
        const found = corpora.find((el) => el.corpus === corpus);

        if (found) {
            return { ...found };
        } else {
            return { corpus: corpus, desc: "" };
        }
    });

    if (isMain) {
        corporaListUpdated.push({ corpus: "ELRC Collection", desc: "" });
        corporaListUpdated.push({ corpus: "ELRA Collection", desc: "" });
    }
    return corporaListUpdated;
}