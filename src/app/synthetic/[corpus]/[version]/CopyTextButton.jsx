// app/synthetic/[corpus]/[version]/CopyTextButton.jsx
"use client";

import { useState } from "react";
import { Copy } from "lucide-react";
import s from "./page.module.css";

export default function CopyTextButton({ text = "", label = "Copy" }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 900);
    } catch {
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 900);
      } catch {
        // ignore
      }
    }
  }

  return (
    <button
      type="button"
      className={s.copyBtn}
      onClick={copy}
      disabled={!text}
      aria-label={label}
      title={copied ? "Copied!" : label}
      data-copied={copied ? "1" : "0"}
    >
      <Copy width={16} />
      <span>{copied ? "Copied" : label}</span>
    </button>
  );
}
