import Link from "next/link";
import { Eye } from "lucide-react";
import { numberFormatter } from "../../../../../hooks/hooks";
import DashboardTable from "../DashboardTable/DashboardTable";
import { enc } from "@/lib/helpers/enc";

import t from "../DashboardTable/DashboardTable.module.css";

import s from "./AllModelsTable.module.css";

function stripModelPrefixes(name = "") {
  return String(name)
    .replace("HPLT-MT-models/", "")
    .replace("OPUS-MT-models/", "")
    .replace("Tatoeba-MT-models/", "")
    .replace("huggingface/facebook/", "");
}

function fmtScore(value, metric) {
  if (value == null || value === "") return "";
  const n = Number(value);
  if (!Number.isFinite(n)) return "";
  const digits = metric === "bleu" || metric === "spbleu" ? 1 : 3;
  return n.toFixed(digits);
}

function fmtPosDiff(a, b, metric) {
  const na = Number(a);
  const nb = Number(b);
  if (!Number.isFinite(na) || !Number.isFinite(nb)) return "";
  const digits = metric === "bleu" || metric === "spbleu" ? 1 : 3;
  const diff = +(na - nb).toFixed(digits);
  return diff > 0 ? diff.toFixed(digits) : "";
}

export default function AllModelsTable({
  modelType = "all",
  score = "bleu",
  origin = "",
  target = "",
  data,
}) {
  const rows = Array.isArray(data?.cleanData) ? data.cleanData : [];

  const hasContrib = rows.some((r) => r?.contributed);
  const hasOpusSize = rows.some((r) => r?.size);
  const hasExtSize = rows.some((r) => r?.external?.size);

  const {
    opusAvgScore,
    externalAvgScore,
    opusSizeAvg,
    externalSizeAvg,
    diffScoreAvg,
  } = data || {};

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
      key: "bench",
      header: "Benchmark",
      tdClass: s.bench,
      cell: (r) => {
        const testset = r?.testset ?? "";
        return testset ? (
          <Link
            className={t.link}
            href={`/mt?source=${origin}&target=${target}&score=${score}&benchmark=${testset}&model=all`}
          >
            {testset}
          </Link>
        ) : (
          <span className={t.muted}>—</span>
        );
      },
    },
    {
      key: "out",
      header: "Output",
      align: "center",
      cell: (r) => {
        const testset = r?.testset ?? "";
        const opusModel = r?.model ?? "";
        const extModel = r?.external?.model ?? "";
        const contModel = r?.contributed?.model ?? "";

        const opusLink = enc(opusModel);
        const extLink = enc(extModel);
        const contLink = enc(contModel);

        const compareHref = `/mt/compare?dataset=${testset}&src=${origin}&trg=${target}&type=${
          r?.external ? modelType : "opus"
        }&m1=${opusLink}&m2=${extLink}${
          r?.contributed ? `&m3=${contLink}` : "&m3=none"
        }&from=dashboard`;

        return (
          <Link
            className={t.iconBtn}
            href={compareHref}
            aria-label="Open output comparison"
          >
            <Eye width={18} />
          </Link>
        );
      },
    },
    {
      key: "opusModel",
      header: "OPUS-MT",
      cell: (r) => {
        const opusModel = r?.model ?? "";
        const opusLink = enc(opusModel);
        return opusModel ? (
          <Link
            className={t.link}
            href={`/mt?source=${origin}&target=${target}&score=${score}&benchmark=none&model=${opusLink}`}
          >
            {stripModelPrefixes(opusModel)}
          </Link>
        ) : (
          <span className={t.muted}>—</span>
        );
      },
    },
    {
      key: "extModel",
      header: "External",
      cell: (r) => {
        const extModel = r?.external?.model ?? "";
        const extLink = enc(extModel);
        return extModel ? (
          <Link
            className={t.link}
            href={`/mt?source=${origin}&target=${target}&score=${score}&benchmark=none&model=${extLink}`}
          >
            {stripModelPrefixes(extModel)}
          </Link>
        ) : (
          <span className={t.muted}>—</span>
        );
      },
    },
    {
      key: "contModel",
      header: "Contributed",
      when: hasContrib,
      cell: (r) => {
        const contModel = r?.contributed?.model ?? "";
        const contLink = enc(contModel);
        return contModel ? (
          <Link
            className={t.link}
            href={`/mt?source=${origin}&target=${target}&score=${score}&benchmark=none&model=${contLink}`}
          >
            {stripModelPrefixes(contModel)}
          </Link>
        ) : (
          <span className={t.muted}>—</span>
        );
      },
    },

    {
      key: "opusScore",
      header: `${score.toUpperCase()} (OPUS)`,
      align: "center",
      cell: (r) =>
        fmtScore(r?.score, score) || <span className={t.muted}>—</span>,
    },
    {
      key: "extScore",
      header: `${score.toUpperCase()} (Ext)`,
      align: "center",
      cell: (r) =>
        fmtScore(r?.external?.score, score) || (
          <span className={t.muted}>—</span>
        ),
    },

    {
      key: "contScore",
      header: `${score.toUpperCase()} (Cont)`,
      when: hasContrib,
      align: "center",
      cell: (r) =>
        fmtScore(r?.contributed?.score, score) || (
          <span className={t.muted}>—</span>
        ),
    },

    {
      key: "diffOE",
      header: "Diff (OPUS-Ext)",
      align: "center",
      cell: (r) =>
        fmtPosDiff(r?.score, r?.external?.score, score) || (
          <span className={t.muted}>—</span>
        ),
    },

    {
      key: "diffOC",
      header: "Diff (OPUS-Cont)",
      when: hasContrib,
      align: "center",
      cell: (r) =>
        fmtPosDiff(r?.score, r?.contributed?.score, score) || (
          <span className={t.muted}>—</span>
        ),
    },

    {
      key: "opusSize",
      header: "Size (OPUS)",
      when: hasOpusSize,
      align: "center",
      cell: (r) =>
        r?.size ? numberFormatter(r.size) : <span className={t.muted}>—</span>,
    },
    {
      key: "extSize",
      header: "Size (Ext)",
      when: hasExtSize,
      align: "center",
      cell: (r) =>
        r?.external?.size ? (
          numberFormatter(r.external.size)
        ) : (
          <span className={t.muted}>—</span>
        ),
    },
  ];

  const footer = rows.length
    ? {
        key: "avg",
        renderCell: (col) => {
          const avgLabelCol = modelType === "all" ? "extModel" : "opusModel";

          if (col.key === avgLabelCol)
            return <span className={s.sumLabel}>Average</span>;

          if (col.key === "opusScore") {
            return opusAvgScore != null ? (
              +Number(opusAvgScore).toFixed(2)
            ) : (
              <span className={t.muted}>—</span>
            );
          }

          if (col.key === "extScore") {
            return externalAvgScore != null ? (
              +Number(externalAvgScore).toFixed(2)
            ) : (
              <span className={t.muted}>—</span>
            );
          }

          if (col.key === "diffOE") {
            return diffScoreAvg != null ? (
              +Number(diffScoreAvg).toFixed(2)
            ) : (
              <span className={t.muted}>—</span>
            );
          }

          // contributed averages are intentionally not shown (same as your current component)
          if (col.key === "opusSize") {
            return opusSizeAvg ? (
              numberFormatter(opusSizeAvg)
            ) : (
              <span className={t.muted}>—</span>
            );
          }

          if (col.key === "extSize") {
            return externalSizeAvg ? (
              numberFormatter(externalSizeAvg)
            ) : (
              <span className={t.muted}>—</span>
            );
          }

          return "";
        },
      }
    : null;

  return (
    <DashboardTable
      columns={cols}
      rows={rows}
      rowKey={(r) => {
        const testset = r?.testset ?? "";
        const opusModel = r?.model ?? "";
        const extModel = r?.external?.model ?? "";
        const contModel = r?.contributed?.model ?? "";
        return `${testset}::${opusModel}::${extModel || "noext"}::${
          contModel || "nocont"
        }`;
      }}
      footer={footer}
    />
  );
}
