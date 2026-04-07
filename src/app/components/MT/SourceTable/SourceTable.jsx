import Link from "next/link";
import { Eye } from "lucide-react";
import { numberFormatter } from "../../../../../hooks/hooks";
import { enc } from "@/lib/helpers/enc";
import s from "./SourceTable.module.css";

export default function SourceTable({
  score,
  modelType,
  origin,
  target,
  data,
}) {
  const rows = Array.isArray(data?.cleanData) ? data.cleanData : [];
  const hasSize = rows.some((r) => r?.size);

  const avgScore = data?.avgScore;
  const avgSize = data?.avgSize;

  return (
    <div className={s.wrap}>
      <table className={s.table}>
        <thead className={s.head}>
          <tr>
            <th className={s.id}>ID</th>
            <th>Benchmark</th>
            <th>Model</th>
            {hasSize && <th className={s.r}>Size</th>}
            <th className={s.c}>Output</th>
            <th className={s.c}>{score.toUpperCase()}</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row, idx) => {
            const testset = row?.testset ?? "";
            const model = row?.model ?? "";
            const modelLink = enc(model);

            const rowKey = `${testset}::${model || "nomodel"}::${idx}`;

            return (
              <tr key={rowKey} className={s.row}>
                <td className={s.id}>{idx}</td>

                <td className={s.bench}>
                  <Link
                    className={s.link}
                    href={`/mt?source=${origin}&target=${target}&score=${score}&benchmark=${testset}&model=all`}
                  >
                    {testset || "—"}
                  </Link>
                </td>

                <td className={s.model}>
                  {model ? (
                    <Link
                      className={s.link}
                      href={`/mt?source=${origin}&target=${target}&score=${score}&benchmark=none&model=${modelLink}`}
                    >
                      {model}
                    </Link>
                  ) : (
                    <span className={s.muted}>—</span>
                  )}
                </td>

                {hasSize && (
                  <td className={s.r}>
                    {row?.size ? (
                      numberFormatter(row.size)
                    ) : (
                      <span className={s.muted}>—</span>
                    )}
                  </td>
                )}

                <td className={s.c}>
                  {model ? (
                    <Link
                      className={s.iconBtn}
                      href={`/mt/compare?dataset=${testset}&src=${origin}&trg=${target}&type=${modelType}&m1=${modelLink}&from=dashboard`}
                      aria-label="Open output comparison"
                      title="Open output comparison"
                    >
                      <Eye width={18} />
                    </Link>
                  ) : (
                    <span className={s.muted}>—</span>
                  )}
                </td>

                <td className={s.c}>
                  {row?.score != null ? (
                    numberFormatter(row.score)
                  ) : (
                    <span className={s.muted}>—</span>
                  )}
                </td>
              </tr>
            );
          })}

          {rows.length > 0 && (
            <tr className={s.sum}>
              <td className={s.id} />
              <td />
              <td className={s.sumLabel}>Average</td>
              {hasSize && (
                <td className={s.r}>
                  {avgSize != null ? (
                    numberFormatter(avgSize)
                  ) : (
                    <span className={s.muted}>—</span>
                  )}
                </td>
              )}
              <td />
              <td className={s.c}>
                {avgScore != null ? (
                  numberFormatter(avgScore)
                ) : (
                  <span className={s.muted}>—</span>
                )}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
