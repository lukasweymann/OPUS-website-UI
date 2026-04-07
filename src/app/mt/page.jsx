import MTDashboardClient from "./MTDashboardClient";

export const dynamic = "force-dynamic";

async function getLangLists() {
  const base = process.env.BASE;
  if (!base) {
    throw new Error("Missing env var BASE (used to fetch langpairs.txt)");
  }

  const res = await fetch(
    `${base}/OPUS-MT-leaderboard/master/scores/langpairs.txt`,
    {
      cache: "no-store",
    },
  );

  if (!res.ok) {
    throw new Error(
      `Failed to fetch langpairs.txt (${res.status} ${res.statusText})`,
    );
  }

  const text = await res.text();

  const rows = text
    .split("\n")
    .map((r) => r.trim())
    .filter(Boolean)
    .map((r) => r.split("\t"));

  const sourceSet = new Set();
  const targetSet = new Set();

  rows.forEach((lang) => {
    const pair = lang?.[0];
    if (!pair) return;

    const [source, target] = pair.split("-");
    if (source) sourceSet.add(source);
    if (target) targetSet.add(target);
  });

  return {
    sourceData: Array.from(sourceSet),
    targetData: Array.from(targetSet),
  };
}

export default async function MTPage() {
  const { sourceData, targetData } = await getLangLists();
  return <MTDashboardClient sourceData={sourceData} targetData={targetData} />;
}
