import Link from "next/link";
import { Eye, Download } from "lucide-react";
import { numberFormatter } from "../../../../../hooks/hooks";
import DashboardTable from "../DashboardTable/DashboardTable";
import { enc } from "@/lib/helpers/enc";
import t from "../DashboardTable/DashboardTable.module.css";

function fmtScore(v, metric) {
  if (v == null || Number.isNaN(Number(v))) return null;
  const n = Number(v);
  const d = metric === "bleu" || metric === "spbleu" ? 1 : 3;
  return n.toFixed(d);
}

function filterByType(rows, modelType) {
  if (!Array.isArray(rows)) return [];
  if (modelType === "all") return rows;
  const want =
    modelType === "opus"
      ? "OPUS"
      : modelType === "external"
        ? "External"
        : "Contributed";
  return rows.filter((r) => r?.catalog === want);
}

function downloadUrl(item) {
  const model = String(item?.model ?? "");
  const catalog = String(item?.catalog ?? "");
  if (!model) return "";

  if (catalog === "External") {
    return model.replace("huggingface", "https://huggingface.co");
  }
  if (catalog === "OPUS") {
    return `https://object.pouta.csc.fi/${model}.zip`;
  }
  return "";
}

export default function TestsetTable({
  score = "bleu",
  tableData,
  modelType = "all",
  benchmark = "",
  origin = "",
  target = "",
}) {
  if (!tableData) return null;

  const baseRows = Array.isArray(tableData?.cleanData)
    ? tableData.cleanData
    : [];
  const rows = filterByType(baseRows, modelType);

  const cols = [
    {
      key: "id",
      header: "ID",
      align: "right",
      thClass: t.id,
      tdClass: t.id,
      cell: (_r, idx) => idx,
    },
    {
      key: "model",
      header: "Model",
      cell: (r) => {
        const m = r?.model;
        if (!m) return <span className={t.muted}>—</span>;
        return (
          <Link
            className={t.link}
            href={`/mt?source=${origin}&target=${target}&score=${score}&benchmark=none&model=${enc(m)}`}
          >
            {m}
          </Link>
        );
      },
    },
    {
      key: "score",
      header: score.toUpperCase(),
      align: "center",
      cell: (r) => {
        const out = fmtScore(r?.score, score);
        return out ?? <span className={t.muted}>—</span>;
      },
    },
    {
      key: "size",
      header: "Size",
      align: "right",
      cell: (r) =>
        r?.size ? numberFormatter(r.size) : <span className={t.muted}>—</span>,
    },
    {
      key: "sample",
      header: "Sample",
      align: "center",
      cell: (r) => {
        const m = r?.model;
        const cat = String(r?.catalog ?? "").toLowerCase();
        if (!benchmark || !m) return <span className={t.muted}>—</span>;
        return (
          <Link
            className={t.iconBtn}
            href={`/mt/compare?dataset=${benchmark}&src=${origin}&trg=${target}&type=${cat}&m1=${enc(
              m,
            )}&dashboard`}
            aria-label="Open sample comparison"
            title="Open sample comparison"
          >
            <Eye width={18} />
          </Link>
        );
      },
    },
    {
      key: "dl",
      header: "Link",
      align: "center",
      cell: (r) => {
        const url = downloadUrl(r);
        if (!url) return <span className={t.muted}>—</span>;
        return (
          <a
            className={t.iconBtn}
            href={url}
            target="_blank"
            rel="noreferrer"
            aria-label="Open download link"
            title="Open download link"
          >
            <Download width={18} />
          </a>
        );
      },
    },
  ];

  const footer = {
    key: "avg",
    renderCell: (col) => {
      if (col.key === "model") return "Average";

      if (col.key === "score") {
        const v =
          modelType === "all"
            ? tableData?.avgScore
            : modelType === "opus"
              ? tableData?.opusAvgScore
              : tableData?.externalAvgScore;
        return v != null ? (
          Number(v).toFixed(2)
        ) : (
          <span className={t.muted}>—</span>
        );
      }

      if (col.key === "size") {
        const v =
          modelType === "all"
            ? tableData?.allSizesAvg
            : modelType === "opus"
              ? tableData?.opusSizesAvg
              : tableData?.externalSizesAvg;
        return v != null ? (
          numberFormatter(v)
        ) : (
          <span className={t.muted}>—</span>
        );
      }

      return "";
    },
  };

  return (
    <DashboardTable
      columns={cols}
      rows={rows}
      rowKey={(r, i) =>
        `${r?.catalog || "x"}::${r?.model || "nomodel"}::${
          benchmark || "b"
        }::${i}`
      }
      footer={rows.length ? footer : null}
    />
  );
}
