// components/SyntheticTable/SyntheticTableRow.jsx
import Link from "next/link";
import SyntheticDropdown from "../Dropdown/Dropdown";
import s from "./TableRow.module.css";
import { Eye } from "lucide-react";

const nfFull = new Intl.NumberFormat("en-US");
const nfCompact = new Intl.NumberFormat("en", { notation: "compact" });

function safeNum(x) {
  const n = Number(x);
  return Number.isFinite(n) ? n : 0;
}

export default function SyntheticTableRow({ data }) {
  const {
    name = "",
    version = "",
    src_lang = "",
    tgt_lang = "",
    lang_pair = "",
    src_tokens,
    tgt_tokens,
    alignments,
    downloads,
  } = data || {};

  const a = safeNum(alignments);
  const st = safeNum(src_tokens);
  const tt = safeNum(tgt_tokens);

  // keep query param raw; Next will encode correctly in the URL
  const href = `/synthetic/${encodeURIComponent(name)}/${encodeURIComponent(
    version,
  )}?pair=${encodeURIComponent(lang_pair)}`;

  const bilingual = downloads?.alignments
    ? [{ ...downloads.alignments, format: "xml" }]
    : [];

  const mono = [];
  if (downloads?.source_language) {
    mono.push({
      ...downloads.source_language,
      format: `raw ${src_lang}`,
    });
  }
  if (downloads?.target_language) {
    mono.push({
      ...downloads.target_language,
      format: `raw ${tgt_lang}`,
    });
  }

  return (
    <tr className={s.row}>
      <td className={s.nameCell}>
        <Link href={href} className={s.nameLink}>
          {name} <span className={s.ver}>{version}</span>
        </Link>
      </td>

      <td className={s.num}>
        <span className={s.full}>{nfFull.format(a)}</span>
        <span className={s.compact}>{nfCompact.format(a)}</span>
      </td>

      <td className={s.num}>
        <span className={s.full}>{nfFull.format(st)}</span>
        <span className={s.compact}>{nfCompact.format(st)}</span>
      </td>

      <td className={s.num}>
        <span className={s.full}>{nfFull.format(tt)}</span>
        <span className={s.compact}>{nfCompact.format(tt)}</span>
      </td>
      <td>
        <Link
          href={`/synthetic/${name}/${version}/${src_lang}&${tgt_lang}/sample`}
          className={s.sampleLink}
          aria-label={`View sample for ${name} ${version}`}
        >
          <Eye className={s.eye} strokeWidth={1.6} />
        </Link>
      </td>

      <td className={s.dd}>
        <SyntheticDropdown data={bilingual} />
      </td>

      <td className={s.dd}>
        <SyntheticDropdown data={mono} />
      </td>
    </tr>
  );
}
