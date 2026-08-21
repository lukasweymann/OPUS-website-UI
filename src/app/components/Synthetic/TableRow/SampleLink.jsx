"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye } from "lucide-react";
import LoaderSpinner from "../../ui/LoaderSpinner/LoaderSpinner";
import s from "./TableRow.module.css";

export default function SampleLink({ href, label }) {
  const [loading, setLoading] = useState(false);

  function handleClick(event) {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.altKey ||
      event.ctrlKey ||
      event.shiftKey
    ) {
      return;
    }

    setLoading(true);
  }

  return (
    <Link
      href={href}
      className={s.sampleLink}
      aria-label={loading ? `${label} loading` : label}
      aria-busy={loading ? "true" : undefined}
      data-loading={loading ? "true" : undefined}
      onClick={handleClick}
    >
      {loading ? (
        <LoaderSpinner size={18} decorative />
      ) : (
        <Eye className={s.eye} strokeWidth={1.6} aria-hidden="true" />
      )}
    </Link>
  );
}
