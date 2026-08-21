"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Braces, ChevronDown } from "lucide-react";

import Logo from "../../../../public/logos/opus_medium.png";
import LogoWhite from "../../../../public/logos/opus_medium-white.png";

import ThemeToggle from "./ThemeToggle";
import SearchWithSuspense from "../Search/SearchWithSuspense";

import styles from "./Navbar.module.css";
import buttonStyles from "@/styles/Buttons.module.css";

const NAV_LINKS = [
  { href: "/contact", label: "Contribute" },
  { href: "/publications", label: "Publications" },
  { href: "/corpora", label: "Corpora", variant: "secondary" },
  { href: "/synthetic", label: "Synthetic", variant: "secondary" },
  {
    href: "/mt?source=eng&target=fra&score=spbleu&benchmark=all&model=all",
    label: "Dashboard",
    variant: "primary",
  },
];

const API_LINKS = [
  { href: "/opusapi", label: "OPUS API", desc: "Corpus and language queries" },
  { href: "/mt-api", label: "MT API", desc: "Evaluation scores and models" },
  {
    href: "/synthetic-api",
    label: "Synthetic API",
    desc: "Synthetic collections and pairs",
  },
];

export default function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const apiIsActive = API_LINKS.some(
    ({ href }) => pathname === href || pathname.startsWith(`${href}/`),
  );
  const apiRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);
  const [isApiOpen, setIsApiOpen] = useState(false);
  const [isMobileApiOpen, setIsMobileApiOpen] = useState(false);

  const closeMenu = () => {
    setIsOpen(false);
    setIsApiOpen(false);
    setIsMobileApiOpen(false);
  };

  useEffect(() => {
    function onPointerDown(event) {
      if (!apiRef.current?.contains(event.target)) {
        setIsApiOpen(false);
      }
    }

    function onKeyDown(event) {
      if (event.key === "Escape") setIsApiOpen(false);
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const variantClass = {
    primary: buttonStyles.primaryButton,
    secondary: buttonStyles.secondaryButton,
    tertiary: buttonStyles.tertiaryButton,
  };

  const isActiveHref = (href) => {
    const path = href.split("?")[0];
    return pathname === path || (path !== "/" && pathname.startsWith(`${path}/`));
  };

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
      <div className={styles.actions}>
        <ThemeToggle />
        <div className={styles.apiGroup} ref={apiRef}>
          <button
            type="button"
            className={`${styles.apiButton} ${buttonStyles.secondaryButton} ${
              apiIsActive ? styles.apiActive : ""
            }`}
            aria-haspopup="menu"
            aria-expanded={isApiOpen}
            aria-controls="api-menu"
            onClick={() => setIsApiOpen((open) => !open)}
          >
            <Braces size={16} aria-hidden="true" />
            <span>API</span>
            <ChevronDown
              size={15}
              className={`${styles.chevron} ${
                isApiOpen ? styles.chevronOpen : ""
              }`}
              aria-hidden="true"
            />
          </button>

          <div
            id="api-menu"
            className={`${styles.apiMenu} ${
              isApiOpen ? styles.apiMenuOpen : ""
            }`}
            role="menu"
          >
            {API_LINKS.map(({ href, label, desc }) => (
              <Link
                key={href}
                href={href}
                className={styles.apiMenuLink}
                role="menuitem"
                onClick={() => setIsApiOpen(false)}
              >
                <span className={styles.apiMenuTitle}>{label}</span>
                <span className={styles.apiMenuDesc}>{desc}</span>
              </Link>
            ))}
          </div>
        </div>
        {NAV_LINKS.map(({ href, label, variant }) => (
          <Link
            key={href}
            href={href}
            className={`${styles.link} ${variant ? variantClass[variant] : ""} ${
              isActiveHref(href) ? styles.linkActive : ""
            }`}
            aria-current={isActiveHref(href) ? "page" : undefined}
          >
            {label}
          </Link>
        ))}
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
            if (open) setIsMobileApiOpen(false);
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
        <div className={styles.mobileGroup}>
          <button
            type="button"
            className={`${styles.mobileApiButton} ${
              apiIsActive ? styles.menuLinkActive : ""
            }`}
            aria-expanded={isMobileApiOpen}
            aria-controls="mobile-api-menu"
            onClick={() => setIsMobileApiOpen((open) => !open)}
          >
            <span className={styles.mobileApiLabel}>
              <Braces size={16} aria-hidden="true" />
              API
            </span>
            <ChevronDown
              size={16}
              className={`${styles.chevron} ${
                isMobileApiOpen ? styles.chevronOpen : ""
              }`}
              aria-hidden="true"
            />
          </button>

          <div
            id="mobile-api-menu"
            className={`${styles.mobileApiMenu} ${
              isMobileApiOpen ? styles.mobileApiMenuOpen : ""
            }`}
          >
            {API_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`${styles.mobileApiLink} ${
                  isActiveHref(href) ? styles.menuLinkActive : ""
                }`}
                aria-current={isActiveHref(href) ? "page" : undefined}
                onClick={closeMenu}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
        {NAV_LINKS.map(({ href, label, variant }) => (
          <Link
            key={href}
            href={href}
            className={`${styles.menuLink} ${
              variant === "primary" ? variantClass[variant] : ""
            } ${isActiveHref(href) ? styles.menuLinkActive : ""}`}
            aria-current={isActiveHref(href) ? "page" : undefined}
            onClick={closeMenu}
          >
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
