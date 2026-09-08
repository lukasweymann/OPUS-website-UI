"use client";

import { useEffect, useMemo, useRef, useState, useId } from "react";
import ms from "./MiniSelect.module.css";

/** options: [{label, value}] */
export default function MiniSelect({
  options = [],
  value = "",
  onChange,
  placeholder = "Select…",
  disabled = false,
  labelClassName = "",
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);

  const btnRef = useRef(null);
  const popRef = useRef(null);
  const inputRef = useRef(null);
  const itemRefs = useRef([]); // scroll active into view

  // Filtered options by query (case-insensitive substring)
  const items = useMemo(() => {
    const t = q.trim().toLowerCase();
    return t
      ? options.filter((o) =>
          String(o?.label || "")
            .toLowerCase()
            .includes(t)
        )
      : options;
  }, [options, q]);

  const selectedLabel = useMemo(() => {
    return options.find((o) => o.value === value)?.label ?? "";
  }, [options, value]);

  function closeAndFocus() {
    setOpen(false);
    btnRef.current?.focus();
  }

  function selectAt(i) {
    const opt = items[i];
    if (!opt) return;
    onChange?.(opt.value);
    closeAndFocus();
  }

  // Close on outside click
  useEffect(() => {
    function onDoc(e) {
      if (!open) return;
      if (
        !btnRef.current?.contains(e.target) &&
        !popRef.current?.contains(e.target)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  // Focus search + reset query on close
  useEffect(() => {
    if (open) {
      // ensure refs array matches items length
      itemRefs.current = itemRefs.current.slice(0, items.length);
      setTimeout(() => inputRef.current?.focus(), 0);
    } else {
      setQ("");
    }
  }, [open, items.length]);

  // When opening (or when filter changes), set active to selected (if visible) else 0
  useEffect(() => {
    if (!open) return;
    const idx = items.findIndex((o) => o.value === value);
    setActiveIdx(idx >= 0 ? idx : 0);
  }, [open, items, value]);

  // Scroll active item into view (only when menu is open)
  useEffect(() => {
    if (!open) return;
    const el = itemRefs.current[activeIdx];
    el?.scrollIntoView?.({ block: "nearest" });
  }, [open, activeIdx]);

  function onBtnKeyDown(e) {
    if (disabled) return;

    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen(true);
    }
  }

  function onMenuKeyDown(e) {
    if (!open) return;
    const max = items.length - 1;
    if (max < 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(max, i + 1));
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(0, i - 1));
      return;
    }

    if (e.key === "Home") {
      e.preventDefault();
      setActiveIdx(0);
      return;
    }

    if (e.key === "End") {
      e.preventDefault();
      setActiveIdx(max);
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      selectAt(activeIdx);
      return;
    }

    if (e.key === "Escape") {
      e.preventDefault();
      closeAndFocus();
    }
  }

  const activeId = `ms-opt-${id}-${activeIdx}`;

  return (
    <div className={ms.box} data-open={open ? "true" : undefined}>
      <button
        type="button"
        className={ms.btn}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`ms-list-${id}`}
        onClick={() => !disabled && setOpen((o) => !o)}
        onKeyDown={onBtnKeyDown}
        disabled={disabled}
        autoComplete="off"
        ref={btnRef}
      >
        <span
          className={`${ms.label} ${selectedLabel ? labelClassName : ""}`}
        >
          {selectedLabel || placeholder}
        </span>
        <span className={ms.caret} aria-hidden>
          ▾
        </span>
      </button>

      {open && (
        <div className={ms.pop} ref={popRef}>
          <input
            ref={inputRef}
            className={ms.search}
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onMenuKeyDown}
            placeholder="Search…"
            aria-label="Filter options"
          />

          <ul
            id={`ms-list-${id}`}
            className={ms.list}
            role="listbox"
            tabIndex={-1}
            onKeyDown={onMenuKeyDown}
            aria-activedescendant={activeId}
          >
            {items.length === 0 && (
              <li className={ms.empty} aria-disabled="true">
                No matches
              </li>
            )}

            {items.map((o, i) => (
              <li
                key={o.value}
                id={`ms-opt-${id}-${i}`}
                ref={(el) => (itemRefs.current[i] = el)}
                role="option"
                aria-selected={o.value === value}
                className={`${ms.item} ${i === activeIdx ? ms.active : ""} ${
                  o.value === value ? ms.selected : ""
                }`}
                onMouseEnter={() => setActiveIdx(i)}
                onMouseDown={(e) => e.preventDefault()} // keep input focus
                onClick={() => selectAt(i)}
              >
                {o.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
