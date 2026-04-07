"use client";

import { Copy } from "react-feather";
import { toast } from "react-hot-toast";
import s from "./page.module.css";

async function copyNative(text) {
  // modern
  if (navigator?.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return true;
  }

  // fallback
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.setAttribute("readonly", "");
  ta.style.position = "fixed";
  ta.style.left = "-9999px";
  document.body.appendChild(ta);
  ta.select();
  const ok = document.execCommand("copy");
  document.body.removeChild(ta);
  return ok;
}

export default function CopyBibtexButton({ text }) {
  return (
    <button
      type="button"
      className={s.copy}
      onClick={async () => {
        try {
          const ok = await copyNative(text);
          if (ok) toast.success("BibTeX copied to clipboard");
          else toast.error("Copy failed");
        } catch {
          toast.error("Copy failed");
        }
      }}
    >
      Copy BibTeX <Copy width={18} className={s.copyI} />
    </button>
  );
}
