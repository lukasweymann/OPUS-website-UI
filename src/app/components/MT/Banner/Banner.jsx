"use client";
import { Suspense } from "react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { ArrowRightLeft, GitCompare, History } from "lucide-react";

import s from "./Banner.module.css";

const LINK_ICONS = {
  scores: ArrowRightLeft,
  models: GitCompare,
  history: History,
};

export default function DashboardBanner() {
  const [open, setOpen] = useState(false);

  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    setOpen(false);
  }, [pathname, searchParams]);

  const links = [
    {
      key: "scores",
      label: "Compare scores",
      href: "/mt?source=eng&target=fra&score=spbleu&benchmark=all&model=all",
    },
    {
      key: "models",
      label: "Compare models",
      href: "/mt/compare-models?src=eng&trg=fra&score=bleu&view=models",
    },
    { key: "history", label: "Release history", href: "/mt/release-history" },
  ];

  function CompareModelsFallback() {
    return <div style={{ padding: 16 }}>Loading filters…</div>;
  }

  return (
    <Suspense fallback={<CompareModelsFallback />}>
      <header className={s.wrap}>
        <div className={s.bar}>
          <h1 className={s.title}>
            OPUS-<span>MT</span> Dashboard
          </h1>

          <nav className={s.nav} aria-label="Dashboard">
            {links.map((l) => {
              const Icon = LINK_ICONS[l.key] ?? ArrowRightLeft;

              return (
                <Link key={l.key} href={l.href} className={s.link}>
                  <Icon className={s.linkIcon} size={16} strokeWidth={1.9} />
                  <span>{l.label}</span>
                </Link>
              );
            })}
          </nav>

          <button
            type="button"
            className={s.burger}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="dashboard-menu"
            onClick={() => setOpen((v) => !v)}
          >
            <span className={s.burgerLine} />
            <span className={s.burgerLine} />
            <span className={s.burgerLine} />
          </button>
        </div>

        <nav
          id="dashboard-menu"
          className={`${s.menu} ${open ? s.menuOpen : ""}`}
          aria-label="Dashboard mobile"
        >
          {links.map((l) => {
            const Icon = LINK_ICONS[l.key] ?? ArrowRightLeft;

            return (
              <Link
                key={`m-${l.key}`}
                href={l.href}
                className={s.menuLink}
                onClick={() => setOpen(false)}
              >
                <Icon className={s.linkIcon} size={16} strokeWidth={1.9} />
                <span>{l.label}</span>
              </Link>
            );
          })}
        </nav>
      </header>
    </Suspense>
  );
}
