"use client";

import { useMemo, useState } from "react";
import {
  ArrowDownAzIcon,
  ArrowDownZaIcon,
  ArrowDown10,
  ArrowDown01,
} from "lucide-react";

import TableRow from "./TableRow/TableRow";
import s from "./Table.module.css";

function keyOfRow(r) {
  // stable and unique for your dataset
  return `${r.corpus}__${r.version}`;
}

function formatNumber(value) {
  return new Intl.NumberFormat("en", {
    notation: "compact",
    compactDisplay: "short",
    maximumFractionDigits: 1,
  }).format(Number(value || 0));
}

export default function CorporaTable({
  tableData = [],
  langPair = [],
  showAllVersionsByDefault = false,
}) {
  const [q, setQ] = useState("");
  const [showAllVersions, setShowAllVersions] = useState(
    showAllVersionsByDefault,
  );
  const [sort, setSort] = useState({ by: "sent", dir: "desc" }); // by: "sent" | "name"

  const srcCode = langPair?.[0]?.value ?? "src";
  const trgCode = langPair?.[1]?.value ?? "trg";

  const filtered = useMemo(() => {
    const baseData = showAllVersions
      ? tableData
      : tableData.filter((r) => String(r.latest) === "True");

    const query = q.trim().toLowerCase();
    if (!query) return baseData;

    return baseData.filter((r) =>
      String(r.corpus || "")
        .toLowerCase()
        .includes(query),
    );
  }, [tableData, q, showAllVersions]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    if (arr.length < 2) return arr;

    arr.sort((a, b) => {
      if (sort.by === "sent") {
        const A = Number(a.sents ?? 0);
        const B = Number(b.sents ?? 0);
        return sort.dir === "desc" ? B - A : A - B;
      }

      // name sort
      const A = String(a.corpus || "").toLowerCase();
      const B = String(b.corpus || "").toLowerCase();
      const cmp = A.localeCompare(B);
      return sort.dir === "asc" ? cmp : -cmp;
    });

    return arr;
  }, [filtered, sort]);

  const totals = useMemo(() => {
    return sorted.reduce(
      (acc, row) => {
        acc.sents += Number(row.sents ?? 0);
        acc.srcTok += Number(row.srcTokens ?? row.srcTokens ?? 0);
        acc.trgTok += Number(row.trgTokens ?? row.trgTokens ?? 0);
        return acc;
      },
      { sents: 0, srcTok: 0, trgTok: 0 },
    );
  }, [sorted]);

  const total = sorted.length;

  return (
    <section className={s.wrap}>
      <div className={s.controls}>
        <div className={s.search}>
          <label className={s.label} htmlFor="corpora-search">
            Search by corpus
          </label>
          <input
            id="corpora-search"
            type="search"
            className={s.input}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Type a corpus name…"
          />
        </div>

        {!showAllVersionsByDefault && (
          <label>
            <input
              type="checkbox"
              checked={showAllVersions}
              onChange={(e) => setShowAllVersions(e.target.checked)}
            />{" "}
            Display all versions
          </label>
        )}
      </div>

      {total > 0 ? (
        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead className={s.thead}>
              <tr>
                <th className={s.thName}>
                  <span>Corpus</span>
                  {total > 1 && (
                    <span className={s.sort}>
                      <button
                        type="button"
                        className={s.sortBtn}
                        onClick={() => setSort({ by: "name", dir: "asc" })}
                        aria-label="Sort by name A to Z"
                      >
                        <ArrowDownAzIcon size={18} />
                      </button>
                      <button
                        type="button"
                        className={s.sortBtn}
                        onClick={() => setSort({ by: "name", dir: "desc" })}
                        aria-label="Sort by name Z to A"
                      >
                        <ArrowDownZaIcon size={18} />
                      </button>
                    </span>
                  )}
                </th>

                <th className={s.thNum}>
                  <span className={s.sentFull}>sentences</span>
                  <span className={s.sentShort}>sents</span>
                  {total > 1 && (
                    <span className={s.sort}>
                      <button
                        type="button"
                        className={s.sortBtn}
                        onClick={() => setSort({ by: "sent", dir: "desc" })}
                        aria-label="Sort by sentences descending"
                      >
                        <ArrowDown10 size={18} />
                      </button>
                      <button
                        type="button"
                        className={s.sortBtn}
                        onClick={() => setSort({ by: "sent", dir: "asc" })}
                        aria-label="Sort by sentences ascending"
                      >
                        <ArrowDown01 size={18} />
                      </button>
                    </span>
                  )}
                </th>

                <th className={s.thRight}>{srcCode} tok</th>
                <th className={s.thRight}>{trgCode} tok</th>
                <th>sample</th>
                <th>bilingual</th>
                <th>monolingual</th>
              </tr>
            </thead>

            <tbody>
              {sorted.map((row) => (
                <TableRow key={keyOfRow(row)} corpusData={row} />
              ))}
            </tbody>

            <tfoot>
              <tr>
                <th className={s.thName}>Total</th>
                <th className={s.thNum}>{formatNumber(totals.sents)}</th>
                <th className={s.thRight}>{formatNumber(totals.srcTok)}</th>
                <th className={s.thRight}>{formatNumber(totals.trgTok)}</th>
                <th></th>
                <th></th>
                <th></th>
              </tr>
            </tfoot>
          </table>
        </div>
      ) : (
        <div className={s.empty}>No results found</div>
      )}
    </section>
  );
}
