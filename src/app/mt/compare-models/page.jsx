import { Suspense } from "react";
import DashboardBanner from "@/app/components/MT/Banner/Banner";
import CompareModelsClient from "./CompareModelsClient";

export const revalidate = 900;

async function fetchLangPairs() {
  const base = process.env.BASE ?? process.env.base;
  if (!base) return { sourceData: [], targetData: [] };

  const url = `${base}/OPUS-MT-leaderboard/master/scores/langpairs.txt`;
  const res = await fetch(url, { next: { revalidate: 900 } });
  if (!res.ok) return { sourceData: [], targetData: [] };

  const text = await res.text();
  const rows = text
    .split("\n")
    .map((r) => r.trim())
    .filter(Boolean);

  const src = new Set();
  const trg = new Set();

  for (const line of rows) {
    const [pair] = line.split("\t");
    if (!pair) continue;
    const [a, b] = pair.split("-");
    if (a) src.add(a);
    if (b) trg.add(b);
  }

  return {
    sourceData: Array.from(src),
    targetData: Array.from(trg),
  };
}

function CompareModelsFallback() {
  return <div style={{ padding: 16 }}>Loading filters…</div>;
}

export default async function CompareModelsPage() {
  const { sourceData, targetData } = await fetchLangPairs();

  return (
    <>
      <Suspense fallback={<CompareModelsFallback />}>
        <DashboardBanner />
        <CompareModelsClient sourceData={sourceData} targetData={targetData} />
      </Suspense>
    </>
  );
}
