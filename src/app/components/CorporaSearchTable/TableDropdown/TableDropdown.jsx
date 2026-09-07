"use client";

import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { Download, Link as LinkIcon, Check } from "lucide-react";
import { toast } from "../../ui/Toast/toast";
import s from "./TableDropdown.module.css";

function optKey(o) {
  return `${o?.format ?? "fmt"}::${o?.url ?? ""}`;
}

export default function TableDropdown({
  data = [],
  defaultFormat = [],
  portalMenu = false,
}) {
  const uid = useId();
  const btnRef = useRef(null);
  const menuRef = useRef(null);

  const options = useMemo(() => (Array.isArray(data) ? data : []), [data]);

  const initialUrl = useMemo(() => {
    if (defaultFormat?.[0]?.url) return defaultFormat[0].url;
    if (options?.[0]?.url) return options[0].url;
    return "";
  }, [defaultFormat, options]);

  const [open, setOpen] = useState(false);
  const [selUrl, setSelUrl] = useState(initialUrl);
  const [active, setActive] = useState(0);
  const [menuStyle, setMenuStyle] = useState(null);

  const selected = useMemo(
    () => options.find((o) => o?.url === selUrl) ?? options[0] ?? null,
    [options, selUrl]
  );

  // Keep selection valid if options change (e.g., paging/search)
  useEffect(() => {
    if (!options.length) {
      setSelUrl("");
      setOpen(false);
      return;
    }
    if (!selUrl) setSelUrl(initialUrl);
    else if (!options.some((o) => o?.url === selUrl)) setSelUrl(initialUrl);
  }, [options, selUrl, initialUrl]);

  // Close on outside click
  useEffect(() => {
    if (!open) setMenuStyle(null);
  }, [open]);

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

  useLayoutEffect(() => {
    if (!open || !portalMenu) return;

    function updatePosition() {
      const rect = btnRef.current?.getBoundingClientRect();
      if (!rect) return;

      const gap = 8;
      const viewportPad = 8;
      const estimatedHeight = Math.min(
        260,
        Math.max(42, options.length * 31 + 8),
      );
      const availableBelow = window.innerHeight - rect.bottom - viewportPad;
      const availableAbove = rect.top - viewportPad;
      const opensUp =
        availableBelow < estimatedHeight && availableAbove > availableBelow;
      const maxHeight = Math.max(
        42,
        Math.min(
          estimatedHeight,
          opensUp ? availableAbove - gap : availableBelow - gap,
        ),
      );
      const width = Math.min(
        Math.max(rect.width, 156),
        window.innerWidth - viewportPad * 2,
      );
      const left = Math.min(
        Math.max(viewportPad, rect.left),
        window.innerWidth - width - viewportPad,
      );
      const top = opensUp
        ? Math.max(viewportPad, rect.top - maxHeight - gap)
        : Math.min(
            rect.bottom + gap,
            window.innerHeight - maxHeight - viewportPad,
          );

      setMenuStyle({
        position: "fixed",
        top: `${top}px`,
        left: `${left}px`,
        minWidth: `${width}px`,
        maxWidth: `calc(100vw - ${viewportPad * 2}px)`,
        maxHeight: `${maxHeight}px`,
      });
    }

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, options.length, portalMenu]);

  // When opening, set active to selected
  useEffect(() => {
    if (!open) return;
    const idx = Math.max(
      0,
      options.findIndex((o) => o?.url === selected?.url)
    );
    setActive(idx === -1 ? 0 : idx);
  }, [open, options, selected?.url]);

  function closeAndFocus() {
    setOpen(false);
    queueMicrotask(() => btnRef.current?.focus());
  }

  function choose(idx) {
    const o = options[idx];
    if (!o?.url) return;
    setSelUrl(o.url);
    closeAndFocus();
  }

  function onBtnKeyDown(e) {
    if (!options.length) return;

    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen(true);
      return;
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
      setActive((i) => Math.min(options.length - 1, i + 1));
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(0, i - 1));
      return;
    }

    if (e.key === "Home") {
      e.preventDefault();
      setActive(0);
      return;
    }

    if (e.key === "End") {
      e.preventDefault();
      setActive(options.length - 1);
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      choose(active);
      return;
    }
  }

  async function copyUrl() {
    const url = selected?.url;
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("URL copied");
    } catch {
      toast.error("Copy failed");
    }
  }

  if (!options.length) return <span className={s.empty}>—</span>;

  const menu = (
    <div
      ref={menuRef}
      id={`menu-${uid}`}
      role="listbox"
      aria-label="Formats"
      className={`${s.menu} ${portalMenu ? s.portalMenu : ""}`}
      style={portalMenu && menuStyle ? menuStyle : undefined}
      tabIndex={-1}
      onKeyDown={onMenuKeyDown}
    >
      {options.map((o, idx) => {
        const isSel = o?.url === selected?.url;
        const isActive = idx === active;

        return (
          <button
            key={optKey(o)}
            type="button"
            role="option"
            aria-selected={isSel}
            className={`${s.opt} ${isActive ? s.optActive : ""}`}
            onMouseEnter={() => setActive(idx)}
            onClick={() => choose(idx)}
          >
            <span className={s.optText}>{o?.format ?? "—"}</span>
            {isSel && <Check className={s.check} strokeWidth={2} />}
          </button>
        );
      })}
    </div>
  );

  return (
    <div
      className={s.wrap}
      data-open={open ? "true" : undefined}
      data-portal={portalMenu ? "true" : undefined}
    >
      <button
        ref={btnRef}
        type="button"
        className={s.btn}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`menu-${uid}`}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={onBtnKeyDown}
        title={selected?.format || "Select format"}
      >
        <span className={s.btnText}>{selected?.format ?? "Select"}</span>
        <span className={s.caret} aria-hidden="true">
          ▾
        </span>
      </button>

      <div className={s.actions}>
        {selected?.url ? (
          <>
            <a
              className={s.iconBtn}
              href={selected.url}
              aria-label="Download"
              title="Download"
            >
              <Download className={s.icon} strokeWidth={1.6} />
            </a>
            <button
              type="button"
              className={s.iconBtn}
              onClick={copyUrl}
              aria-label="Copy URL"
              title="Copy URL"
            >
              <LinkIcon className={s.icon} strokeWidth={1.6} />
            </button>
          </>
        ) : null}
      </div>

      {open &&
        (portalMenu ? menuStyle && createPortal(menu, document.body) : menu)}
    </div>
  );
}
