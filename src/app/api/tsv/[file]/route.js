import { NextResponse } from "next/server";

export const runtime = "nodejs";

function json(data, status = 200) {
  return NextResponse.json(data, { status });
}

function error(message, status = 400) {
  return json({ success: false, error: message }, status);
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

function safePathSegment(value) {
  const segment = clean(value);
  if (!segment || segment.includes("/") || segment.includes("\\")) return null;
  return segment;
}

function parseFileParam(file = "") {
  const parts = String(file).split("&").map(clean);

  if (parts.length >= 4) {
    return {
      src: parts[0].replaceAll("-", "_"),
      trg: parts[1].replaceAll("-", "_"),
      version: parts[2],
      name: parts.slice(3).join("&"),
    };
  }

  if (parts.length === 3) {
    const pair = parts[0].replaceAll("-", "_");
    const pairParts = pair.includes("_") ? pair.split("_") : pair.split("-");
    if (pairParts.length === 2) {
      return {
        src: pairParts[0],
        trg: pairParts[1],
        version: parts[1],
        name: parts[2],
      };
    }
  }

  return null;
}

function encodePath(...segments) {
  return segments.map((segment) => encodeURIComponent(segment)).join("/");
}

async function fetchOverlap(url) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) return null;
  const data = await response.text();
  return { values: data.split("\n") };
}

export async function GET(_req, { params }) {
  const base = clean(process.env.BASE_REPO);

  if (!base) {
    return error("Report repository URL not configured", 500);
  }

  const routeParams = await params;
  const parsed = parseFileParam(
    routeParams?.file ? decodeParam(routeParams.file) : "",
  );
  if (!parsed) {
    return error("Expected /api/tsv/{src&trg&version&corpus}", 400);
  }

  const src = safePathSegment(parsed.src);
  const trg = safePathSegment(parsed.trg);
  const version = safePathSegment(parsed.version);
  const name = safePathSegment(parsed.name);

  if (!src || !trg || !version || !name) {
    return error("Invalid overlap request", 400);
  }

  const root = base.endsWith("/") ? base.slice(0, -1) : base;
  const firstLangPair = `${src}-${trg}`;
  const secondLangPair = `${trg}-${src}`;

  const candidates = [
    `${root}/corpus/${encodePath(name, version, "overlaps", `${firstLangPair}.tsv`)}`,
    `${root}/corpus/${encodePath(name, version, "overlaps", `${secondLangPair}.tsv`)}`,
    `${root}/${encodePath(name, version, "overlaps", `${secondLangPair}.tsv`)}`,
  ];

  try {
    for (const url of candidates) {
      const overlap = await fetchOverlap(url);
      if (overlap) return json(overlap);
    }
  } catch {
    return error("No overlap data found", 404);
  }

  return error("No overlap data found", 404);
}

export const POST = methodNotAllowed;
export const PUT = methodNotAllowed;
export const PATCH = methodNotAllowed;
export const DELETE = methodNotAllowed;
