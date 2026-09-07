// components/SyntheticTable/SyntheticDropdown.jsx
"use client";

import { useMemo, useState } from "react";
import { Download, Link as LinkIcon } from "lucide-react";
import MiniSelect from "@/app/components/Search/MiniSelect/MiniSelect";
import TableDropdown from "@/app/components/CorporaSearchTable/TableDropdown/TableDropdown";
import s from "./Dropdown.module.css";

function safeText(v) {
  return typeof v === "string" ? v : "";
}

function IconCopyButton({ text = "", label = "Copy URL" }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 900);
    } catch {
      // fallback
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
      className={s.iconBtn}
      onClick={copy}
      aria-label={label}
      title={copied ? "Copied!" : label}
      data-copied={copied ? "1" : "0"}
      disabled={!text}
    >
      <LinkIcon size={16} />
    </button>
  );
}

export default function SyntheticDropdown({ data = [], portalMenu = false }) {
  // Normalize and ignore invalid rows (null url etc)
  const items = useMemo(() => {
    const arr = Array.isArray(data) ? data : [];
    return arr
      .map((x) => ({
        format: safeText(x?.format),
        url: safeText(x?.url),
        size: x?.size ?? null,
      }))
      .filter((x) => x.format && x.url);
  }, [data]);

  const [selectedUrl, setSelectedUrl] = useState(items?.[0]?.url ?? "");

  // Keep selected item valid if data changes
  const selected = useMemo(() => {
    const hit = items.find((i) => i.url === selectedUrl);
    return hit || items[0] || null;
  }, [items, selectedUrl]);

  const options = useMemo(
    () => items.map((i) => ({ value: i.url, label: i.format })),
    [items]
  );

  const disabled = options.length === 0;

  if (portalMenu) {
    return <TableDropdown data={items} portalMenu />;
  }

  return (
    <div className={s.wrap}>
      <div className={s.select}>
        <MiniSelect
          options={options}
          value={selected?.url ?? ""}
          onChange={(v) => setSelectedUrl(String(v))}
          placeholder={disabled ? "No files" : "Select…"}
          disabled={disabled}
        />
      </div>

      <a
        className={s.iconBtn}
        href={selected?.url || "#"}
        aria-label="Download"
        title={selected?.url ? "Download" : "No file"}
        data-disabled={selected?.url ? "0" : "1"}
        onClick={(e) => {
          if (!selected?.url) e.preventDefault();
        }}
      >
        <Download size={16} />
      </a>

      <IconCopyButton text={selected?.url ?? ""} />
    </div>
  );
}
