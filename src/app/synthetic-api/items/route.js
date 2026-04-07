import { NextResponse } from "next/server";
import { callLangpairsService } from "@/lib/langpairsServiceClient";

export const runtime = "nodejs";

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);

        const name = searchParams.get("name");
        const version = searchParams.get("version");
        const lang_pair = searchParams.get("lang_pair");
        const src = searchParams.get("src");
        const tgt = searchParams.get("tgt");

        const data = await callLangpairsService({
            mode: "items",
            name,
            version,
            lang_pair,
            src,
            tgt,
        });

        return NextResponse.json(data, { status: 200 });
    } catch (err) {
        console.error("[/synthetic-api/items] Error:", err);
        return NextResponse.json(
            { error: "items_failed", details: String(err?.message || err) },
            { status: 500 }
        );
    }
}
