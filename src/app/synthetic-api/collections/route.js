import { NextResponse } from "next/server";
import { callLangpairsService } from "@/lib/langpairsServiceClient";

export const runtime = "nodejs";

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const name = searchParams.get("name");

        const data = await callLangpairsService({
            mode: "collections",
            name,
        });

        return NextResponse.json(data, { status: 200 });
    } catch (err) {
        console.error("[/synthetic-api/collections] Error:", err);
        return NextResponse.json(
            { error: "collections_failed", details: String(err?.message || err) },
            { status: 500 }
        );
    }
}
