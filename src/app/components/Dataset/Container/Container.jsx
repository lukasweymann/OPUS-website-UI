"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";

import { languagePairName } from "../../../../../hooks/hooks";
import SearchWithSuspense from "@/app/components/Search/SearchWithSuspense";
import CorporaTable from "@/app/components/CorporaSearchTable/Table";
import Overlaps from "../Overlaps/Overlaps";
import LoaderSpinner from "../../ui/LoaderSpinner/LoaderSpinner";

import s from "./Container.module.css";

const DOWNLOADS_LOADER_SIZE = 22;
const DATASET_PAIR_PENDING_EVENT = "opus:dataset-pair-pending";

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
  const [tablePair, setTablePair] = useState("");
  const [overlapData, setOverlapData] = useState(null);
  const [overlapPair, setOverlapPair] = useState("");
  const [pendingPair, setPendingPair] = useState("");
  const [status, setStatus] = useState({ table: "idle", tsv: "idle" }); // idle|loading|ok|error
  const [err, setErr] = useState({ table: "", tsv: "" });
  const pendingPairTimerRef = useRef(null);

  const langPair = useMemo(() => {
    if (!pair) return null;
    return languagePairName(pair.split("&"));
  }, [pair]);

  useEffect(() => {
    return () => {
      if (pendingPairTimerRef.current) {
        clearTimeout(pendingPairTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    function onPendingPair(event) {
      const nextCorpus = String(event?.detail?.corpus ?? "");
      const nextPair = String(event?.detail?.pair ?? "");
      if (!nextPair || nextCorpus !== String(corpus ?? "")) return;
      if (nextPair === pair && tablePair === pair && status.table !== "loading") {
        return;
      }

      if (pendingPairTimerRef.current) {
        clearTimeout(pendingPairTimerRef.current);
      }

      setPendingPair(nextPair);
      setTableData([]);
      setTablePair("");
      setOverlapData(null);
      setOverlapPair("");
      setErr({ table: "", tsv: "" });
      setStatus({ table: "loading", tsv: "loading" });

      pendingPairTimerRef.current = window.setTimeout(() => {
        setPendingPair("");
      }, 4000);
    }

    window.addEventListener(DATASET_PAIR_PENDING_EVENT, onPendingPair);
    return () => {
      window.removeEventListener(DATASET_PAIR_PENDING_EVENT, onPendingPair);
    };
  }, [corpus, pair, status.table, tablePair]);

  useEffect(() => {
    if (!pendingPair || tablePair !== pendingPair || status.table === "loading") {
      return;
    }

    if (pendingPairTimerRef.current) {
      clearTimeout(pendingPairTimerRef.current);
    }
    setPendingPair("");
  }, [pendingPair, status.table, tablePair]);

  useEffect(() => {
    if (!corpus || !pair) return;

    let alive = true;
    const acTable = new AbortController();
    const acTsv = new AbortController();

    // reset for new query
    setPendingPair((current) => (current === pair ? current : ""));
    setTableData([]);
    setTablePair("");
    setOverlapData(null);
    setOverlapPair("");
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
        setTablePair(pair);
        setStatus((p) => ({ ...p, table: "ok" }));
      } catch (e) {
        if (!alive) return;
        setTableData([]);
        setTablePair(pair);
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
          setOverlapData(null);
          setOverlapPair(pair);
          setStatus((p) => ({ ...p, tsv: "error" }));
          setErr((p) => ({ ...p, tsv: `Overlap unavailable (${res.status})` }));
          return;
        }

        const data = await safeJson(res);

        if (!alive) return;
        // expects { values: ... } from the overlap endpoint
        setOverlapData(data);
        setOverlapPair(pair);
        setStatus((p) => ({ ...p, tsv: "ok" }));
      } catch (e) {
        if (!alive) return;
        setOverlapData(null);
        setOverlapPair(pair);
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
  const hasActivePair = Boolean(pendingPair || pair);
  const tableMatchesPair = hasPair && tablePair === pair;
  const overlapMatchesPair = !pendingPair && hasPair && overlapPair === pair;
  const visibleTableData = !pendingPair && tableMatchesPair ? tableData : [];
  const loading =
    Boolean(pendingPair) ||
    (hasPair && (status.table === "loading" || !tableMatchesPair));
  const tableError = hasPair && !loading && status.table === "error";
  const tableEmpty =
    hasPair &&
    !loading &&
    status.table === "ok" &&
    visibleTableData.length === 0;
  const tsvError = hasPair && overlapMatchesPair && status.tsv === "error";
  const hasRows = visibleTableData.length > 0;

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
      {hasActivePair && loading && (
        <p className={s.loadingMsg}>
          <LoaderSpinner size={DOWNLOADS_LOADER_SIZE} decorative />
          <span>Loading results…</span>
        </p>
      )}
      {tableError && (
        <p className={s.msgErr}>{err.table || "Could not load results."}</p>
      )}
      {tableEmpty && (
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
            tableData={visibleTableData}
            langPair={langPair}
            showAllVersionsByDefault
          />
        </div>
      )}
      <p className={s.note}>
        <span>A note on formats:</span> TMX files contain only unique
        translation units. Moses downloads include all non-empty alignment units
        including duplicates. Token counts for each language also include
        duplicate sentences and documents.
      </p>
      {overlapMatchesPair && overlapData?.values && langPair && (
        <div className={s.graph}>
          <Overlaps values={overlapData.values} result={langPair} />
        </div>
      )}
      {tsvError && (
        <p className={s.msgDim}>{err.tsv}</p>
      )}
    </section>
  );
}
