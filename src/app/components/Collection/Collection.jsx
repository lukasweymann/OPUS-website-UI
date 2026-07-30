"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CircleArrowRight as ArrowRightCircle } from "lucide-react";

import s from "./Collection.module.css";

const SPECIAL = new Map([
  ["ELRC Collection", "/ELRC-collection"],
  ["ELRA Collection", "/ELRA-collection"],
  ["MT-560", "/MT560"],
  ["OPUS-100", "/OPUS-100"],
]);

export default function Collection({ cleanCorpora = [], type = "other" }) {
  const [q, setQ] = useState("");

  const corporaSorted = useMemo(() => {
    return [...cleanCorpora].sort((a, b) => {
      const A = (a?.corpus || "").toUpperCase();
      const B = (b?.corpus || "").toUpperCase();
      return A.localeCompare(B);
    });
  }, [cleanCorpora]);

  const shown = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return corporaSorted;
    return corporaSorted.filter((item) => {
      const name = item?.corpus?.toLowerCase();
      return name ? name.includes(query) : false;
    });
  }, [q, corporaSorted]);

  return (
    <section className={s.page}>
      <header className={s.head}>
        <h1 className={s.title}>Find the corpus you are looking for</h1>

        {type === "main" && (
          <p className={s.intro}>
            Here you find the corpora listed by name. The ELRC and ELRA link
            will take you to their entire collections.
          </p>
        )}

        <div className={s.bar}>
          <input
            type="search"
            className={s.input}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Filter by corpus name"
            aria-label="Filter corpora by name"
          />
        </div>
      </header>

      <div className={s.list}>
        {shown.map((item, i) => {
          const corpus = item?.corpus || "";
          const desc = item?.desc || "";

          const href = SPECIAL.get(corpus) ?? `/datasets/${corpus}`;
          const isSpecial = SPECIAL.has(corpus);

          return (
            <Link
              key={corpus || `corpus-${i}`}
              href={href}
              className={`${s.item} ${isSpecial ? s.itemSpecial : ""}`}
            >
              <span className={s.name}>{corpus}</span>
              {desc && <span className={s.desc}>{desc}</span>}

              {isSpecial && (
                <span className={s.icon} aria-hidden="true">
                  <ArrowRightCircle strokeWidth={1.4} />
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
