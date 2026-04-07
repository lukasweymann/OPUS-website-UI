// src/app/mt/release-history/page.jsx
import { Suspense } from "react";
import DashboardBanner from "@/app/components/MT/Banner/Banner";
import ReleaseHistoryClient from "./ReleaseHistoryClient";
import ReleaseTable from "@/app/components/MT/ReleaseTable/ReleaseTable";
import { langName } from "../../../../hooks/hooks";

export const revalidate = 900;

async function fetchText(url) {
  const res = await fetch(url, { next: { revalidate } });
  if (!res.ok) throw new Error(`Fetch failed ${res.status} for ${url}`);
  return res.text();
}

function uniq(arr) {
  return Array.from(new Set(arr.filter(Boolean)));
}

function parseLangpairsTxt(txt) {
  const rows = txt
    .split("\n")
    .map((r) => r.trim())
    .filter(Boolean)
    .map((r) => r.split("\t"));

  const src = [];
  const trg = [];

  for (const row of rows) {
    const pair = row?.[0] || "";
    const [a, b] = pair.split("-");
    if (a && !src.includes(a)) src.push(a);
    if (b && !trg.includes(b)) trg.push(b);
  }

  return { src, trg };
}
function CompareModelsFallback() {
  // Keep it simple (or show skeleton UI)
  return <div style={{ padding: 16 }}>Loading filters…</div>;
}

function parseReleaseHistoryTxt(txt) {
  return txt
    .split("\n")
    .map((r) => r.trim())
    .filter(Boolean)
    .map((r) => r.split("\t"));
}

function buildAllLangs(sourceCodes = [], targetCodes = []) {
  // preserves your original approach: langName(list)->[{label,value}]
  const src = langName(sourceCodes) || [];
  const trg = langName(targetCodes) || [];
  return [...src, ...trg];
}

function normalizeLangpairIfNeeded(rawPair = "", allLangs = []) {
  // preserves your original behavior:
  // if pair is "xx-yy" (len 5), map by LABEL -> VALUE using allLangs
  if (rawPair.length !== 5) return rawPair;

  const pretty = langName(rawPair.split("-")) || [];
  const aLabel = pretty?.[0]?.label;
  const bLabel = pretty?.[1]?.label;

  const a = allLangs.find((x) => x?.label === aLabel);
  const b = allLangs.find((x) => x?.label === bLabel);

  if (a?.value && b?.value) return `${a.value}-${b.value}`;
  return rawPair;
}

function groupByYear(releaseHistory = []) {
  const acc = {};
  for (const r of releaseHistory) {
    const year = String(r.year || "");
    if (!year) continue;
    if (!acc[year]) acc[year] = [];
    acc[year].push({ langpair: r.langpair, model: r.model, name: r.name });
  }

  // keep stable order: newest year first
  return Object.entries(acc)
    .sort(([a], [b]) => Number(b) - Number(a))
    .map(([year, releases]) => ({ year, releases }));
}

async function getReleases() {
  const base = process.env.BASE;
  if (!base) throw new Error("Missing process.env.BASE");

  const [langpairsTxt, historyTxt] = await Promise.all([
    fetchText(`${base}/OPUS-MT-leaderboard/master/scores/langpairs.txt`),
    fetchText(`${base}/OPUS-MT-leaderboard/scoredb/release-history.txt`),
  ]);

  const { src, trg } = parseLangpairsTxt(langpairsTxt);

  const sourceCodes = uniq(src);
  const targetCodes = uniq(trg);

  const allLangs = buildAllLangs(sourceCodes, targetCodes);

  const rows = parseReleaseHistoryTxt(historyTxt);

  const releaseHistory = rows.map((item) => {
    const year = item?.[0] ?? "";
    const collection = item?.[1] ?? "";
    const rawPair = item?.[2] ?? "";
    const modelOnly = item?.[3] ?? "";

    const langpair = normalizeLangpairIfNeeded(rawPair, allLangs);

    return {
      year: String(year),
      langpair,
      model: `${rawPair}/${modelOnly}`,
      modelOnly,
      name: `${collection}/${rawPair}/${modelOnly}`,
    };
  });

  return groupByYear(releaseHistory);
}

export default async function ReleaseHistoryPage() {
  const releases = await getReleases();

  return (
    <>
      <Suspense fallback={<CompareModelsFallback />}>
        <DashboardBanner />
        <ReleaseHistoryClient releases={releases} ReleaseTable={ReleaseTable} />
      </Suspense>
    </>
  );
}
