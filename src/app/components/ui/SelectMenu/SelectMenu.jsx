"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Check } from "lucide-react";
import s from "./SelecMenu.module.css";

function keyOf(o) {
  return `${o?.label ?? "opt"}::${String(o?.value ?? "")}`;
}

export default function SelectMenu({
  value,
  onChange,
  options = [], // [{ value, label }]
  ariaLabel = "Select",
  width = 120,
}) {
  const uid = useId();
  const btnRef = useRef(null);
  const menuRef = useRef(null);

  const opts = useMemo(
    () => (Array.isArray(options) ? options : []),
    [options]
  );
  const sel = useMemo(
    () => opts.find((o) => o.value === value) ?? opts[0] ?? null,
    [opts, value]
  );

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  useEffect(() => {
    function onDown(e) {
      if (!open) return;
      const t = e.target;
      if (btnRef.current?.contains(t)) return;
      if (menuRef.current?.contains(t)) return;
      setOpen(false);
    }
    window.addEventListener("pointerdown", onDown);
    return () => window.removeEventListener("pointerdown", onDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const idx = Math.max(
      0,
      opts.findIndex((o) => o.value === sel?.value)
    );
    setActive(idx === -1 ? 0 : idx);
  }, [open, opts, sel?.value]);

  function closeAndFocus() {
    setOpen(false);
    queueMicrotask(() => btnRef.current?.focus());
  }

  function choose(idx) {
    const o = opts[idx];
    if (!o) return;
    onChange?.(o.value);
    closeAndFocus();
  }

  function onBtnKeyDown(e) {
    if (!opts.length) return;
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen(true);
    }
  }

  function onMenuKeyDown(e) {
    if (!open) return;

    if (e.key === "Escape") {
      e.preventDefault();
      closeAndFocus();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(opts.length - 1, i + 1));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(0, i - 1));
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      choose(active);
    }
  }

  if (!opts.length) return null;

  return (
    <div className={s.wrap} style={{ width }}>
      <button
        ref={btnRef}
        type="button"
        className={s.btn}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`menu-${uid}`}
        aria-label={ariaLabel}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={onBtnKeyDown}
      >
        <span className={s.text}>{sel?.label ?? "Select"}</span>
        <span className={s.caret} aria-hidden="true">
          ▾
        </span>
      </button>

      {open && (
        <div
          ref={menuRef}
          id={`menu-${uid}`}
          role="listbox"
          className={s.menu}
          tabIndex={-1}
          onKeyDown={onMenuKeyDown}
        >
          {opts.map((o, idx) => {
            const isSel = o.value === sel?.value;
            const isActive = idx === active;

            return (
              <button
                key={keyOf(o)}
                type="button"
                role="option"
                aria-selected={isSel}
                className={`${s.opt} ${isActive ? s.optActive : ""}`}
                onMouseEnter={() => setActive(idx)}
                onClick={() => choose(idx)}
              >
                <span className={s.optText}>{o.label}</span>
                {isSel && <Check className={s.check} strokeWidth={2} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
