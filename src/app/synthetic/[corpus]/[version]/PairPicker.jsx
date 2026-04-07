// app/synthetic/[corpus]/[version]/PairPicker.jsx
"use client";

import { useMemo } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import MiniSelect from "@/app/components/Search/MiniSelect/MiniSelect";
import s from "./page.module.css";

export default function PairPicker({
  options = [],
  value = "",
  corpus,
  version,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const current = useMemo(() => {
    const v = typeof value === "string" ? value : "";
    return v;
  }, [value]);

  function setPair(next) {
    const params = new URLSearchParams(sp?.toString() || "");
    if (next) params.set("pair", next);
    else params.delete("pair");

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <div className={s.picker}>
      <div className={s.pickerField}>
        <MiniSelect
          options={options}
          value={current}
          onChange={(v) => setPair(v)}
          placeholder="Select language pair…"
          disabled={!options.length}
        />
      </div>

      {current && (
        <button type="button" className={s.clear} onClick={() => setPair("")}>
          Clear
        </button>
      )}
    </div>
  );
}
