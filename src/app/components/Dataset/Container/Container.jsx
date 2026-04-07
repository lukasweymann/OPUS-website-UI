"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";

import { languagePairName } from "../../../../../hooks/hooks";
import SearchWithSuspense from "@/app/components/Search/SearchWithSuspense";
import CorporaTable from "@/app/components/CorporaSearchTable/Table";
import Overlaps from "../Overlaps/Overlaps";

import s from "./Container.module.css";

function parsePair(searchParams) {
  const qs = searchParams?.toString?.() ?? "";
  const i = qs.indexOf("pair=");
  if (i < 0) return null;

  const raw = qs.slice(i + "pair=".length); // e.g. "eng&fra" or "eng&fra=" or "eng&fra=&x=1"
  const parts = raw.split("&");

  const a = (parts[0] ?? "").replaceAll("=", "").trim();
  const b = (parts[1] ?? "").replaceAll("=", "").trim();

  if (!a || !b) return null;
  return `${a}&${b}`;
}

async function safeJson(res) {
  const ct = res.headers.get("content-type") || "";
  const text = await res.text();
  if (!text) return null;
  if (ct.includes("application/json")) return JSON.parse(text);
  // fallback: some endpoints might respond JSON without header
  try {
    return JSON.parse(text);
  } catch {
    return text; // last resort
  }
}

export default function CorpusPageContainer({ version = "" }) {
  const { corpus } = useParams() || {};
  const searchParams = useSearchParams();

  const pair = useMemo(() => parsePair(searchParams), [searchParams]);

  const [tableData, setTableData] = useState([]); // always array
  const [overlapData, setOverlapData] = useState(null);
  const [status, setStatus] = useState({ table: "idle", tsv: "idle" }); // idle|loading|ok|error
  const [err, setErr] = useState({ table: "", tsv: "" });

  const langPair = useMemo(() => {
    if (!pair) return null;
    return languagePairName(pair.split("&"));
  }, [pair]);

  useEffect(() => {
    if (!corpus || !pair) return;

    let alive = true;
    const acTable = new AbortController();
    const acTsv = new AbortController();

    // reset for new query
    setTableData([]);
    setOverlapData(null);
    setErr({ table: "", tsv: "" });
    setStatus({ table: "loading", tsv: "loading" });

    (async () => {
      // ---- table ----
      try {
        const [src, trg] = pair.replaceAll("-", "_").split("&");
        const params = new URLSearchParams({
          dataset: corpus,
          source: src,
          target: trg,
        });

        const res = await fetch(`/api/corpora-table?${params}`, {
          method: "GET",
          signal: acTable.signal,
        });

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(
            `${res.status} ${res.statusText}${text ? ` — ${text}` : ""}`,
          );
        }

        const json = await res.json();
        const rows = Array.isArray(json)
          ? json
          : Array.isArray(json?.data)
            ? json.data
            : [];

        if (!alive) return;
        setTableData(rows);
        setStatus((p) => ({ ...p, table: "ok" }));
      } catch (e) {
        if (!alive) return;
        setStatus((p) => ({ ...p, table: "error" }));
        setErr((p) => ({
          ...p,
          table: e?.message || "Failed to load results",
        }));
      }

      // ---- tsv / overlap ----
      try {
        const url = `/api/tsv/${pair.replaceAll(
          "-",
          "_",
        )}&${version}&${corpus}`;
        const res = await fetch(url, { method: "GET", signal: acTsv.signal });

        if (!res.ok) {
          // don't throw hard; just mark as unavailable
          if (!alive) return;
          setStatus((p) => ({ ...p, tsv: "error" }));
          setErr((p) => ({ ...p, tsv: `Overlap unavailable (${res.status})` }));
          return;
        }

        const data = await safeJson(res);

        if (!alive) return;
        // expects { values: ... } like your old axios usage
        setOverlapData(data);
        setStatus((p) => ({ ...p, tsv: "ok" }));
      } catch (e) {
        if (!alive) return;
        setStatus((p) => ({ ...p, tsv: "error" }));
        setErr((p) => ({ ...p, tsv: e?.message || "Overlap unavailable" }));
      }
    })();

    return () => {
      alive = false;
      acTable.abort();
      acTsv.abort();
    };
  }, [corpus, pair, version]);

  const hasPair = Boolean(pair);
  const loading = status.table === "loading";
  const hasRows = tableData.length > 0;

  return (
    <section id="download" className={s.wrap}>
      <header className={s.head}>
        <h2 className={s.h}>Downloads</h2>
        <h2 className={s.hAlt}>Corpus information</h2>

        <p className={s.p}>Please, select a language pair.</p>

        <p className={s.pAlt}>
          Please select a language pair.{" "}
          <span>
            If you wish to download OPUS resources, visit the website on
            desktop.
          </span>
        </p>
      </header>
      <div className={s.search}>
        <SearchWithSuspense mode="corpusPage" />
      </div>
      {hasPair && loading && <p className={s.msg}>Loading results…</p>}
      {hasPair && !loading && status.table === "error" && (
        <p className={s.msgErr}>{err.table || "Could not load results."}</p>
      )}
      {hasPair &&
        !loading &&
        status.table === "ok" &&
        tableData.length === 0 && (
          <p className={s.msg}>
            We’re sorry. No results were found for your search.
          </p>
        )}
      {hasPair && hasRows && langPair && (
        <div className={s.res}>
          <div className={s.resHead}>
            <h3 className={s.resTitle}>
              Results for {langPair[0].label} – {langPair[1].label}
            </h3>
          </div>
          <CorporaTable
            tableData={tableData}
            langPair={langPair}
            showAllVersionsByDefault
          />
        </div>
      )}
      pk_live_ab7b2bef0a9efcde4b01442f0edfc2601bdbf3deb940404a
      <p className={s.note}>
        <span>A note on formats:</span> TMX files contain only unique
        translation units. Moses downloads include all non-empty alignment units
        including duplicates. Token counts for each language also include
        duplicate sentences and documents.
      </p>
      {overlapData?.values && langPair && (
        <div className={s.graph}>
          <Overlaps values={overlapData.values} result={langPair} />
        </div>
      )}
      {hasPair && status.tsv === "error" && (
        <p className={s.msgDim}>{err.tsv}</p>
      )}
    </section>
  );
}
