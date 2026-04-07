// components/SyntheticTable/SyntheticTable.jsx
import SyntheticTableRow from "../TableRow/TableRow";
import s from "./ResultTable.module.css";

function splitPair(pair = "") {
  const decoded = decodeURIComponent(String(pair));
  const raw = decoded.includes("&")
    ? decoded
    : decoded.includes("%26")
      ? decoded.replaceAll("%26", "&")
      : decoded;
  const [a = "src", b = "trg"] =
    raw.split("&").length >= 2 ? raw.split("&") : raw.split("-");
  return [a || "src", b || "trg"];
}

export default function SyntheticTable({ data, langPair = "" }) {
  const [src, trg] = splitPair(langPair);

  return (
    <div className={s.wrap}>
      <div className={s.scroller}>
        <table className={s.table}>
          <thead className={s.head}>
            <tr>
              <th className={s.thName}>Corpus</th>

              <th className={s.thNum}>
                <span className={s.sentFull}>sentences</span>
                <span className={s.sentShort}>sents</span>
              </th>

              <th className={s.thRight}>{src} tok</th>
              <th className={s.thRight}>{trg} tok</th>
              <th>sample</th>

              <th>bilingual</th>
              <th>monolingual</th>
            </tr>
          </thead>

          <tbody className={s.body}>
            <SyntheticTableRow data={data} />
          </tbody>
        </table>
      </div>
    </div>
  );
}
