// src/app/mt/release-history/ReleaseHistoryClient.jsx
"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";
import SelectMenu from "@/app/components/ui/SelectMenu/SelectMenu";
import s from "./page.module.css";

const COLLECTIONS = [
  { value: "", label: "All" },
  { value: "Tatoeba-MT-models", label: "Tatoeba-MT-models" },
  { value: "OPUS-MT-models", label: "OPUS-MT-models" },
  { value: "HPLT-MT-models", label: "HPLT-MT-models" },
];

function Pill({ text, onClear }) {
  return (
    <div className={s.pill}>
      <span className={s.pillTxt}>{text}</span>
      <button
        type="button"
        className={s.pillX}
        onClick={onClear}
        aria-label="Clear"
      >
        <X size={16} />
      </button>
    </div>
  );
}

export default function ReleaseHistoryClient({ releases = [], ReleaseTable }) {
  const years = useMemo(() => {
    const ys = releases
      .map((r) => Number(r.year))
      .filter((n) => Number.isFinite(n));
    ys.sort((a, b) => b - a);
    return [
      { value: "", label: "All years" },
      ...ys.map((y) => ({ value: y, label: String(y) })),
    ];
  }, [releases]);

  const [year, setYear] = useState("");
  const [collection, setCollection] = useState("");

  const shown = useMemo(() => {
    const yearStr = year ? String(year) : "";
    const byYear = yearStr
      ? releases.filter((r) => r.year === yearStr)
      : releases;

    const byBoth = byYear
      .map((g) => ({
        ...g,
        releases: collection
          ? g.releases.filter((x) => String(x?.name || "").includes(collection))
          : g.releases,
      }))
      .filter((g) => g.releases.length > 0);

    return byBoth;
  }, [releases, year, collection]);

  return (
    <main className={s.wrap}>
      <header className={s.head}>
        <h1 className={s.h1}>Release history</h1>

        <div className={s.filters}>
          <div className={s.field}>
            <SelectMenu
              ariaLabel="Filter by year"
              value={year}
              onChange={(v) => setYear(v === "" ? "" : Number(v))}
              options={years}
              width={160}
            />
            {year && <Pill text={String(year)} onClear={() => setYear("")} />}
          </div>

          <div className={s.field}>
            <SelectMenu
              ariaLabel="Filter by collection"
              value={collection}
              onChange={(v) => setCollection(String(v || ""))}
              options={COLLECTIONS}
              width={220}
            />
            {collection && (
              <Pill text={collection} onClear={() => setCollection("")} />
            )}
          </div>
        </div>
      </header>

      <section className={s.list}>
        {shown.length ? (
          shown.map((g) => <ReleaseTable key={g.year} release={g} />)
        ) : (
          <div className={s.empty}>No releases match those filters.</div>
        )}
      </section>
    </main>
  );
}
