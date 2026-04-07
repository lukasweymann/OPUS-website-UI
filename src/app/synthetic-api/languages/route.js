
import { NextResponse } from "next/server";
import { callLangpairsService } from "@/lib/langpairsServiceClient";

export const runtime = "nodejs";

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const name = searchParams.get("name");
        const version = searchParams.get("version");

        const data = await callLangpairsService({
            mode: "languages",
            name,
            version,
        });

        return NextResponse.json(data, { status: 200 });
    } catch (err) {
        console.error("[/synthetic-api/languages] Error:", err);
        return NextResponse.json(
            { error: "languages_failed", details: String(err?.message || err) },
            { status: 500 }
        );
    }
}
