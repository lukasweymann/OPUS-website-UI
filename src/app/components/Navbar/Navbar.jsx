"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Braces, ChevronDown, Compass, Library } from "lucide-react";

import Logo from "../../../../public/logos/opus_medium.png";
import LogoWhite from "../../../../public/logos/opus_medium-white.png";

import ThemeToggle from "./ThemeToggle";
import SearchWithSuspense from "../Search/SearchWithSuspense";

import styles from "./Navbar.module.css";
import buttonStyles from "@/styles/Buttons.module.css";

const DASHBOARD_HREF =
  "/mt?source=eng&target=fra&score=spbleu&benchmark=all&model=all";

const NAV_GROUPS = [
  {
    key: "explore",
    label: "Explore",
    Icon: Compass,
    links: [
      { href: "/corpora", label: "Corpora", desc: "Browse released corpora" },
      {
        href: "/synthetic",
        label: "Synthetic",
        desc: "Synthetic corpus collections",
      },
      {
        href: DASHBOARD_HREF,
        label: "Dashboard",
        desc: "MT model scores and comparisons",
      },
    ],
  },
  {
    key: "api",
    label: "API",
    Icon: Braces,
    links: [
      {
        href: "/opusapi",
        label: "OPUS API",
        desc: "Corpus and language queries",
      },
      {
        href: "/mt-api",
        label: "MT API",
        desc: "Evaluation scores and models",
      },
      {
        href: "/synthetic-api",
        label: "Synthetic API",
        desc: "Synthetic collections and pairs",
      },
    ],
  },
  {
    key: "info",
    label: "Info",
    Icon: Library,
    links: [
      {
        href: "/download-formats",
        label: "Data formats",
        desc: "Download format reference",
      },
      {
        href: "/publications",
        label: "Publications",
        desc: "Papers and citations",
      },
    ],
  },
];

const DESKTOP_NAV_GROUPS = [
  NAV_GROUPS.find(({ key }) => key === "api"),
  NAV_GROUPS.find(({ key }) => key === "info"),
  NAV_GROUPS.find(({ key }) => key === "explore"),
].filter(Boolean);

export default function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const groupsRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState("");
  const [openMobileGroup, setOpenMobileGroup] = useState("");

  const closeMenu = () => {
    setIsOpen(false);
    setOpenGroup("");
    setOpenMobileGroup("");
  };

  useEffect(() => {
    function onPointerDown(event) {
      if (!groupsRef.current?.contains(event.target)) {
        setOpenGroup("");
      }
    }

    function onKeyDown(event) {
      if (event.key === "Escape") setOpenGroup("");
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const isActiveHref = (href) => {
    const path = href.split("?")[0];
    return (
      pathname === path || (path !== "/" && pathname.startsWith(`${path}/`))
    );
  };
  const groupIsActive = (links) => links.some(({ href }) => isActiveHref(href));

  return (
    <nav className={styles.nav}>
      <div className={styles.left}>
        <Link href="/" className={styles.brand} onClick={closeMenu}>
          <Image
            src={Logo}
            alt="OPUS logo"
            width={80}
            className={styles.logo}
            priority
            data-hide-on-theme="dark"
          />
          <Image
            src={LogoWhite}
            alt="OPUS logo"
            width={80}
            className={styles.logo}
            priority
            data-hide-on-theme="light"
          />
        </Link>

        {!isHome && <SearchWithSuspense navbar />}
      </div>

      {/* Desktop navigation */}
      <div className={styles.actions} ref={groupsRef}>
        <ThemeToggle />
        {DESKTOP_NAV_GROUPS.map(({ key, label, Icon, links }) => {
          const isExplore = key === "explore";
          return (
            <div className={styles.navGroup} key={key}>
              <button
                type="button"
                className={`${styles.groupButton} ${
                  isExplore
                    ? `${buttonStyles.primaryButton} ${styles.exploreButton}`
                    : buttonStyles.secondaryButton
                } ${
                  groupIsActive(links)
                    ? isExplore
                      ? styles.exploreActive
                      : styles.groupActive
                    : ""
                }`}
                aria-haspopup="menu"
                aria-expanded={openGroup === key}
                aria-controls={`${key}-menu`}
                onClick={() =>
                  setOpenGroup((open) => (open === key ? "" : key))
                }
              >
                <Icon size={16} aria-hidden="true" />
                <span>{label}</span>
                <ChevronDown
                  size={15}
                  className={`${styles.chevron} ${
                    openGroup === key ? styles.chevronOpen : ""
                  }`}
                  aria-hidden="true"
                />
              </button>

              <div
                id={`${key}-menu`}
                className={`${styles.navMenu} ${
                  openGroup === key ? styles.navMenuOpen : ""
                }`}
                role="menu"
              >
                {links.map(({ href, label: itemLabel, desc }) => (
                  <Link
                    key={href}
                    href={href}
                    className={`${styles.navMenuLink} ${
                      isActiveHref(href) ? styles.navMenuLinkActive : ""
                    }`}
                    role="menuitem"
                    aria-current={isActiveHref(href) ? "page" : undefined}
                    onClick={() => setOpenGroup("")}
                  >
                    <span className={styles.navMenuTitle}>{itemLabel}</span>
                    <span className={styles.navMenuDesc}>{desc}</span>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile menu toggle */}
      <button
        type="button"
        className={`${styles.burger} ${isOpen ? styles.burgerOpen : ""}`}
        aria-label={isOpen ? "Close menu" : "Open menu"}
        aria-expanded={isOpen}
        aria-controls="site-menu"
        onClick={() => {
          setIsOpen((open) => {
            if (open) setOpenMobileGroup("");
            return !open;
          });
        }}
      >
        <span className={styles.burgerLine} />
        <span className={styles.burgerLine} />
        <span className={styles.burgerLine} />
      </button>

      {/* Mobile menu */}
      <div
        id="site-menu"
        className={`${styles.menu} ${isOpen ? styles.menuOpen : ""}`}
      >
        <ThemeToggle />
        {NAV_GROUPS.map(({ key, label, Icon, links }) => (
          <div className={styles.mobileGroup} key={key}>
            <button
              type="button"
              className={`${styles.mobileGroupButton} ${
                groupIsActive(links) ? styles.menuLinkActive : ""
              }`}
              aria-expanded={openMobileGroup === key}
              aria-controls={`mobile-${key}-menu`}
              onClick={() =>
                setOpenMobileGroup((open) => (open === key ? "" : key))
              }
            >
              <span className={styles.mobileGroupLabel}>
                <Icon size={16} aria-hidden="true" />
                {label}
              </span>
              <ChevronDown
                size={16}
                className={`${styles.chevron} ${
                  openMobileGroup === key ? styles.chevronOpen : ""
                }`}
                aria-hidden="true"
              />
            </button>

            <div
              id={`mobile-${key}-menu`}
              className={`${styles.mobileSubmenu} ${
                openMobileGroup === key ? styles.mobileSubmenuOpen : ""
              }`}
            >
              {links.map(({ href, label: itemLabel }) => (
                <Link
                  key={href}
                  href={href}
                  className={`${styles.mobileSubmenuLink} ${
                    isActiveHref(href) ? styles.menuLinkActive : ""
                  }`}
                  aria-current={isActiveHref(href) ? "page" : undefined}
                  onClick={closeMenu}
                >
                  {itemLabel}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </nav>
  );
}
