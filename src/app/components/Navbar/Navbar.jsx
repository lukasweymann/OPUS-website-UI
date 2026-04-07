"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Hamburger from "hamburger-react";

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

export default function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => setIsOpen(false);

  const variantClass = {
    primary: buttonStyles.primaryButton,
    secondary: buttonStyles.secondaryButton,
    tertiary: buttonStyles.tertiaryButton,
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
        {NAV_LINKS.map(({ href, label, variant }) => (
          <Link
            key={href}
            href={href}
            className={`${styles.link} ${variant ? variantClass[variant] : ""}`}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* Mobile hamburger */}
      <div className={styles.burger}>
        <Hamburger toggled={isOpen} toggle={setIsOpen} size={20} />
      </div>

      {/* Mobile menu */}
      <div className={`${styles.menu} ${isOpen ? styles.menuOpen : ""}`}>
        <ThemeToggle />
        {NAV_LINKS.map(({ href, label, variant }) => (
          <Link
            key={href}
            href={href}
            className={`${styles.menuLink} ${
              variant ? variantClass[variant] : ""
            }`}
            onClick={closeMenu}
          >
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
