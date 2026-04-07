// src/app/components/ui/SelectField/SelectField.jsx
"use client";

import MiniSelect from "../../Search/MiniSelect/MiniSelect";
import s from "./SelectField.module.css";

function normalizeOptions(options = []) {
  const out = [];
  const seen = new Set();

  for (const opt of options) {
    const rawV =
      typeof opt === "string" ? opt : (opt?.value ?? opt?.id ?? opt?.label);

    const v = String(rawV ?? "");
    if (!v) continue;

    const t = String(
      typeof opt === "string" ? opt : (opt?.label ?? rawV ?? ""),
    );

    if (seen.has(v)) continue;
    seen.add(v);

    out.push({ value: v, label: t || v });
  }

  return out;
}

export default function SelectField({
  label,
  value,
  onChange,
  options = [],
  placeholder = "Select…",
  disabled = false,
}) {
  return (
    <label className={s.field}>
      {label ? <span className={s.label}>{label}</span> : null}
      <MiniSelect
        options={normalizeOptions(options)}
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
      />
    </label>
  );
}
