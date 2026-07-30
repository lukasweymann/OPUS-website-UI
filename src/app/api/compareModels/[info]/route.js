import { NextResponse } from "next/server";
import { getDistinctModels } from "@/lib/scoresQueries";

export const runtime = "nodejs";

function json(data, status = 200) {
  return NextResponse.json(data, { status });
}

function error(message, status = 400) {
  return json({ error: message }, status);
}

function methodNotAllowed() {
  return error("Method not allowed", 405);
}

function decodeParam(value = "") {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function clean(value) {
  return typeof value === "string" ? value.trim() : "";
}

function parseInfo(info = "") {
  const [source, target] = String(info).split("&").map(clean);
  if (!source || !target) return null;
  if (source.includes("/") || target.includes("/")) return null;
  return { source, target };
}

export async function GET(_req, { params }) {
  const routeParams = await params;
  const parsed = parseInfo(
    routeParams?.info ? decodeParam(routeParams.info) : "",
  );

  if (!parsed) {
    return error("Expected /api/compareModels/{source&target&score}", 400);
  }

  try {
    const distinctModels = await getDistinctModels(
      `${parsed.source}-${parsed.target}`,
    );

    return json(distinctModels);
  } catch {
    return error("No models found", 404);
  }
}

export const POST = methodNotAllowed;
export const PUT = methodNotAllowed;
export const PATCH = methodNotAllowed;
export const DELETE = methodNotAllowed;
