import Link from "next/link";
import { Download } from "lucide-react";
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

function modelShortName(model = "") {
  return String(model)
    .replace("OPUS-MT-models/", "")
    .replace("Tatoeba-MT-models/", "")
    .replace("HPLT-MT-models", "");
}

function downloadUrl(item) {
  const model = String(item?.model ?? "");
  const catalog = String(item?.catalog ?? "");

  if (!model) return "";

  if (catalog === "External") {
    return model.replace("huggingface", "https://huggingface.co");
  }

  if (catalog === "OPUS" && !model.includes("hplt")) {
    return `https://object.pouta.csc.fi/${model}.zip`;
  }

  if (catalog === "OPUS" && model.includes("hplt")) {
    const seg = model.split("/")[2];
    return seg ? `https://huggingface.co/HPLT/${seg}` : "";
  }

  return "";
}

export default function AverageTable({
  data,
  score = "bleu",
  modelType = "all",
  origin = "",
  target = "",
}) {
  const rows = filterByType(data?.cleanData, modelType);
  const hasSize = rows.some((r) => r?.size);

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
            {modelShortName(m)}
          </Link>
        );
      },
    },
    {
      key: "score",
      header: score.toUpperCase(),
      align: "center",
      cell: (r) => {
        const v = r?._avg?.score;
        const out = fmtScore(v, score);
        return out ?? <span className={t.muted}>—</span>;
      },
    },
    {
      key: "size",
      header: "Size",
      when: hasSize,
      align: "right",
      cell: (r) =>
        r?.size ? numberFormatter(r.size) : <span className={t.muted}>—</span>,
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
        return (
          (modelType === "all" && data?.scoreAvg) ||
          (modelType === "opus" && data?.opusScoreAvg) ||
          (modelType === "external" && data?.externalScoreAvg) ||
          (modelType === "contributed" && data?.scoreAvg) || ( // fallback
            <span className={t.muted}>—</span>
          )
        );
      }

      if (col.key === "size") {
        return (
          (modelType === "all" && data?.sizeAvg) ||
          (modelType === "opus" && data?.opusSizeAvg) ||
          (modelType === "external" && data?.externalSizeAvg) ||
          (modelType === "contributed" && data?.sizeAvg) || ( // fallback
            <span className={t.muted}>—</span>
          )
        );
      }

      return "";
    },
  };

  return (
    <DashboardTable
      columns={cols}
      rows={rows}
      rowKey={(r, i) => `${r?.catalog || "x"}::${r?.model || "nomodel"}::${i}`}
      footer={rows.length ? footer : null}
    />
  );
}
