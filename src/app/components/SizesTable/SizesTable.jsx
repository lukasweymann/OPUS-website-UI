import Link from "next/link";
import s from "./SizesTable.module.css";

export default function SizesTable({ corpora = [] }) {
  const nf = new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  });

  const pct = (p) => {
    if (!p || p <= 0) return "Not specified";
    const v = p * 100;
    if (v > 0.1) return v.toFixed(2);
    if (v > 0.0001) return v.toFixed(5);
    return v.toFixed(9);
  };

  return (
    <div className={s.wrap}>
      <div className={s.scroller}>
        <table className={s.table}>
          <thead>
            <tr>
              <th>Corpus</th>
              <th className={s.num}>Sentences</th>
              <th className={s.num}>% of OPUS</th>
            </tr>
          </thead>

          <tbody>
            {corpora.map((item, i) => {
              const { corpusName, sentences, version, percentage } = item;
              const key = `${corpusName}-${version}-${i}stuid`;
              const sents = Number(sentences);

              return (
                <tr key={key}>
                  <td className={s.corpusCell}>
                    <Link href={`/datasets/${corpusName}`} className={s.link}>
                      {corpusName}
                    </Link>
                  </td>
                  <td className={s.num}>
                    {sents ? nf.format(sents) : "Not specified"}
                  </td>
                  <td className={s.num}>
                    {sents ? pct(percentage) : "Not specified"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
