import Link from "next/link";
import { Eye } from "lucide-react";
import DashboardTable from "../DashboardTable/DashboardTable";
import t from "../DashboardTable/DashboardTable.module.css";

function enc(x) {
  return encodeURIComponent(String(x ?? ""));
}

function fmtScore(v, metric) {
  if (v == null || Number.isNaN(Number(v))) return null;
  const n = Number(v);
  const d = metric === "bleu" || metric === "spbleu" ? 1 : 3;
  return n.toFixed(d);
}

export default function ModelTable({
  score = "bleu",
  modelType = "all",
  origin = "",
  target = "",
  tableData,
}) {
  const rows = Array.isArray(tableData?.cleanData) ? tableData.cleanData : [];
  const avgScore = tableData?.avgScore;

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
      cell: (r) => {
        const ts = r?.testset ?? "";
        return ts ? (
          <Link
            className={t.link}
            href={`/mt?source=${origin}&target=${target}&score=${score}&benchmark=${ts}&model=all`}
          >
            {ts}
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
        const ts = r?.testset;
        const model = r?.model;
        if (!ts || !model) return <span className={t.muted}>—</span>;
        const cat = String(r?.catalog ?? "").toLowerCase();
        return (
          <Link
            className={t.iconBtn}
            href={`/mt/compare?dataset=${enc(ts)}&src=${origin}&trg=${target}&type=${cat}&m1=${enc(model)}&dashboard`}
            aria-label="Open output comparison"
            title="Open output comparison"
          >
            <Eye width={18} />
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
  ];

  const footer = {
    key: "avg",
    renderCell: (col) => {
      if (col.key === "bench") return "Average";
      if (col.key === "score")
        return avgScore ?? <span className={t.muted}>—</span>;
      return "";
    },
  };

  return (
    <DashboardTable
      columns={cols}
      rows={rows}
      rowKey={(r, i) =>
        `${r?.testset || "notest"}::${r?.model || "nomodel"}::${i}`
      }
      footer={rows.length ? footer : null}
    />
  );
}
