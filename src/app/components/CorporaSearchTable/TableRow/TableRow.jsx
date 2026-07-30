import Link from "next/link";
import { Eye } from "lucide-react";
import TableDropdown from "../TableDropdown/TableDropdown";

import s from "./TableRow.module.css";

const nfFull = new Intl.NumberFormat("en-US");
const nfCompact = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export default function TableRow({ corpusData }) {
  const {
    bilingualFormats,
    monoFormats,
    corpus,
    version,
    src,
    trg,
    sents,
    srcTokens,
    trgTokens,
    defaultFormat,
    monoDefaultFormat,
  } = corpusData;

  return (
    <tr className={s.row}>
      <td className={s.name}>
        <Link
          href={`/datasets/${corpus}?pair=${src}&${trg}`}
          className={s.link}
        >
          {corpus} <span className={s.ver}>{version}</span>
        </Link>
      </td>

      <td className={s.num}>
        <span className={s.big}>{nfFull.format(sents ?? 0)}</span>
        <span className={s.small}>{nfCompact.format(sents ?? 0)}</span>
      </td>

      <td className={s.num}>
        <span className={s.big}>{nfFull.format(srcTokens ?? 0)}</span>
        <span className={s.small}>{nfCompact.format(srcTokens ?? 0)}</span>
      </td>

      <td className={s.num}>
        <span className={s.big}>{nfFull.format(trgTokens ?? 0)}</span>
        <span className={s.small}>{nfCompact.format(trgTokens ?? 0)}</span>
      </td>

      <td className={s.sample}>
        <Link
          href={`/datasets/${corpus}/${version}/${src}&${trg}/sample`}
          className={s.sampleLink}
          aria-label={`View sample for ${corpus} ${version}`}
        >
          <Eye className={s.eye} strokeWidth={1.6} />
        </Link>
      </td>

      <td className={s.drop}>
        <TableDropdown data={bilingualFormats} defaultFormat={defaultFormat} />
      </td>

      <td className={s.drop}>
        <TableDropdown data={monoFormats} defaultFormat={monoDefaultFormat} />
      </td>
    </tr>
  );
}
