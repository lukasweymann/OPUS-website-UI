import s from "./DashboardTable.module.css";

function cx(...xs) {
  return xs.filter(Boolean).join(" ");
}

function alignClass(align) {
  if (align === "center") return s.c;
  if (align === "right") return s.r;
  return "";
}

export default function DashboardTable({
  columns = [],
  rows = [],
  rowKey,
  footer,
}) {
  const cols = columns.filter((c) => c?.when !== false);

  return (
    <div className={s.wrap}>
      <table className={s.table}>
        <thead className={s.head}>
          <tr>
            {cols.map((c) => (
              <th
                key={c.key}
                className={cx(alignClass(c.align), c.thClass)}
                scope="col"
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((row, idx) => {
            const key = rowKey ? rowKey(row, idx) : idx;
            return (
              <tr key={key} className={s.row}>
                {cols.map((c) => (
                  <td
                    key={c.key}
                    className={cx(alignClass(c.align), c.tdClass)}
                  >
                    {c.cell?.(row, idx)}
                  </td>
                ))}
              </tr>
            );
          })}

          {footer && (
            <tr className={cx(s.sum, footer.className)}>
              {cols.map((c, i) => (
                <td key={`f-${footer.key || "sum"}-${c.key}`}>
                  {footer.renderCell?.(c, i)}
                </td>
              ))}
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
