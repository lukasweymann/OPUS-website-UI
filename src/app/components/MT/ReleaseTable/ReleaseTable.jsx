// components/ReleaseTable/ReleaseTable.jsx
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown, X } from "lucide-react";
import s from "./ReleaseTable.module.css";

function encModelPath(p = "") {
  return String(p).replaceAll("/", "%2F");
}

function toPairParam(langpair = "") {
  const lp = String(langpair);
  const main = lp.includes("+") ? lp.split("+")[0] : lp;
  return main.replace("-", "&");
}

function downloadHref(name = "", model = "") {
  // keep your behavior: HPLT -> HF, else -> Pouta zip
  const n = String(name);
  if (n.includes("HPLT")) {
    const parts = String(model).split("/");
    return `https://huggingface.co/HPLT/${parts[1] || parts[0] || ""}`;
  }
  return `https://object.pouta.csc.fi/${n}.zip`;
}

export default function ReleaseTable({ release }) {
  const year = String(release?.year ?? "");
  const rows = Array.isArray(release?.releases) ? release.releases : [];

  const [open, setOpen] = useState(false);

  const normalized = useMemo(() => {
    return rows.map((r) => {
      const name = String(r?.name ?? "");
      const model = String(r?.model ?? "");
      const pair = toPairParam(r?.langpair ?? "");
      const bench = `/mt/${pair}&${encModelPath(name)}/bleu&none`;
      const dl = downloadHref(name, model);

      // stable key from actual identifiers
      const key = `${year}::${name}::${pair}`;

      return { key, name, model, bench, dl };
    });
  }, [rows, year]);

  const btnId = `release-${year}`;
  const panelId = `release-panel-${year}`;

  return (
    <section className={s.wrap}>
      <button
        type="button"
        className={s.toggle}
        id={btnId}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        <span className={s.year}>{year}</span>
        <span className={s.icon} aria-hidden="true">
          {open ? <X size={18} /> : <ChevronDown size={18} />}
        </span>
      </button>

      {open && (
        <div
          className={s.panel}
          id={panelId}
          role="region"
          aria-labelledby={btnId}
        >
          <div className={s.tableWrap}>
            <table className={s.table}>
              <thead>
                <tr>
                  <th>Model</th>
                  <th className={s.thGo}>Benchmark results</th>
                </tr>
              </thead>

              <tbody>
                {normalized.map((r) => (
                  <tr key={r.key}>
                    <td className={s.modelCell}>
                      <Link
                        href={r.dl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={s.link}
                      >
                        <span className={s.name}>{r.name}</span>
                        {r.model && <span className={s.meta}>{r.model}</span>}
                      </Link>
                    </td>

                    <td className={s.goCell}>
                      <Link
                        href={r.bench}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={s.go}
                        aria-label="Open benchmark results"
                        title="Open benchmark results"
                      >
                        <ArrowRight size={18} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
