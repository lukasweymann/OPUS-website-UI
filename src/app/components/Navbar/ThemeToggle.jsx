"use client";

import { useEffect, useState } from "react";
import s from "./ThemeToggle.module.css";

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  localStorage.setItem("theme", theme);
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const current = document.documentElement.dataset.theme;

    const initial =
      stored === "dark" || stored === "light"
        ? stored
        : current === "dark" || current === "light"
        ? current
        : "light";

    setTheme(initial);
    applyTheme(initial);
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      className={s.iconBtn}
      aria-pressed={isDark}
      aria-label="Toggle theme"
      title={isDark ? "Light mode" : "Dark mode"}
    >
      {isDark ? "🌙" : "☀️"}
    </button>
  );
}
