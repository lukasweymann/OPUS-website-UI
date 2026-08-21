// app/synthetic/[corpus]/[version]/PairPicker.jsx
"use client";

import { useMemo, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import MiniSelect from "@/app/components/Search/MiniSelect/MiniSelect";
import LoaderSpinner from "@/app/components/ui/LoaderSpinner/LoaderSpinner";
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
  const [pending, startTransition] = useTransition();

  const current = useMemo(() => {
    const v = typeof value === "string" ? value : "";
    return v;
  }, [value]);

  function setPair(next) {
    const params = new URLSearchParams(sp?.toString() || "");
    if (next) params.set("pair", next);
    else params.delete("pair");

    const qs = params.toString();
    const href = qs ? `${pathname}?${qs}` : pathname;

    startTransition(() => {
      router.replace(href, { scroll: false });
    });
  }

  return (
    <div className={s.picker} aria-busy={pending ? "true" : undefined}>
      <div className={s.pickerField}>
        <MiniSelect
          options={options}
          value={current}
          onChange={(v) => setPair(v)}
          placeholder="Select language pair…"
          disabled={pending || !options.length}
        />
      </div>

      {current && (
        <button
          type="button"
          className={s.clear}
          onClick={() => setPair("")}
          disabled={pending}
        >
          Clear
        </button>
      )}

      {pending && (
        <span className={s.pickerLoading}>
          <LoaderSpinner size={22} label="Loading downloads" />
        </span>
      )}
    </div>
  );
}
