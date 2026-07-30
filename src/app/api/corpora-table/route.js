import { NextResponse } from "next/server";
import { callPythonReadData } from "@/lib/pythonClient";

export const runtime = "nodejs";

function preferFormat(formats, preferences = ["moses", "xml"]) {
    for (const p of preferences) {
        const hit = formats.filter((f) => f.format === p);
        if (hit.length) return hit;
    }
    return [];
}

/**
 * Helper: produce mono format label according to original rules
 */
function monoLabel(preprocessing, source, url) {
    if (preprocessing === "mono" && url.includes("txt")) return `txt ${source}`;
    if (preprocessing === "mono" && url.includes("tok")) return `tok ${source}`;
    return `${preprocessing} ${source}`;
}

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const dataset = searchParams.get("dataset");
        const source = searchParams.get("source");
        const target = searchParams.get("target");

        const corporaResponse = await callPythonReadData({
            corpus: dataset,
            source: source,
            target: target,
        });

        const items = Array.isArray(corporaResponse?.corpora)
            ? corporaResponse.corpora
            : [];



        // 1) Group by (corpus, version)
        const groups = new Map();
        for (const row of items) {
            const key = `${row.corpus}@@${row.version}`;
            if (!groups.has(key)) groups.set(key, []);
            groups.get(key).push(row);
        }

        // 2) Build one output row per (corpus, version) group
        const result = [];
        for (const groupRows of groups.values()) {
            // Representative rows
            const bilingualRows = groupRows.filter((r) => r.source && r.target);
            const anyRow = groupRows[0];
            const rep = bilingualRows[0] ?? anyRow;

            // Collect formats (bilingual) and mono formats in a single pass
            const bilingualFormats = [];
            const monoFormats = [];

            for (const r of groupRows) {
                if (r.source && r.target) {
                    bilingualFormats.push({ format: r.preprocessing, url: r.url });
                } else if (!r.target) {
                    monoFormats.push({
                        format: monoLabel(r.preprocessing, r.source, r.url),
                        url: r.url,
                    });
                }
            }

            // Preferred defaults
            const defaultFormat = preferFormat(bilingualFormats, ["moses", "xml"]);
            const monoDefaultFormat = monoFormats.filter(
                (m) => m.format === `txt ${source.replace("-", "_")}`
            );

            // Preserve the original "format" filtering semantics:
            // if a preferred bilingual format exists, use that label; otherwise fall back.
            const chosenFormat =
                defaultFormat[0]?.format ??
                (bilingualFormats[0]?.format ?? anyRow.preprocessing);

            result.push({
                corpus: rep.corpus,
                version: rep.version,
                src: rep.source,
                trg: rep.target,
                defaultFormat,
                monoDefaultFormat,
                format: chosenFormat,
                sents: rep["alignment_pairs"],
                srcTokens: rep["source_tokens"],
                trgTokens: rep["target_tokens"],
                bilingualFormats,
                monoFormats,
            });
        }

        // 3) Keep the same downstream behavior: prefer "moses"; fallback to "xml"
        const mosesRows = result.filter((el) => el.format === "moses");
        const cleanTableData = mosesRows.length
            ? mosesRows
            : result.filter((el) => el.format === "xml");

        return NextResponse.json(cleanTableData, { status: 200 });
    } catch (err) {
        console.error("API error:", err);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
