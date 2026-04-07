"use client";

import { Copy } from "react-feather";
import { toast, Toaster } from "react-hot-toast";

import s from "./Publication.module.css";

function decodeBase64Safe(b64 = "") {
  // BibTeX is typically ASCII; this also handles UTF-8 safely when present.
  try {
    const bin = atob(b64);
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    return new TextDecoder("utf-8", { fatal: false }).decode(bytes);
  } catch {
    return "";
  }
}

async function copyText(text) {
  if (!text) return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export default function Publication({
  name,
  description,
  authors,
  date,
  pdf,
  bibtex,
  ident,
}) {
  const bibtexText = bibtex ? decodeBase64Safe(bibtex) : "";

  async function onCopy() {
    const ok = await copyText(bibtexText);
    if (ok) toast.success("BibTeX copied");
    else toast.error("Copy failed");
  }

  return (
    <article className={s.card} id={ident}>
      <header className={s.head}>
        <h2 className={s.title}>{name}</h2>
        {description && <p className={s.where}>{description}</p>}
      </header>

      <footer className={s.foot}>
        <p className={s.meta}>
          {authors}
          {date ? (
            <>
              {", "}
              <span className={s.year}>{date}</span>
            </>
          ) : null}
        </p>

        <div className={s.actions}>
          {bibtexText && (
            <button type="button" className={s.btn} onClick={onCopy}>
              BibTeX <Copy width={15} strokeWidth={1.6} />
            </button>
          )}

          {pdf && (
            <a
              className={s.btnPrimary}
              href={pdf}
              target="_blank"
              rel="noreferrer"
            >
              PDF
            </a>
          )}
        </div>
      </footer>

      {/* One global Toaster in your app layout is ideal, but keeping it here won’t break anything */}
      <Toaster />
    </article>
  );
}
