import Image from "next/image";
import Link from "next/link";
import s from "./Partners.module.css";

import nlpl from "@/../public/logos/nlpl-logo.png";
import nlplDark from "@/../public/logos/nlpl-logo-dark.png";
import helsinki from "@/../public/logos/helsinki-logo.png";
import helsinkiDark from "@/../public/logos/helsinki-dark.svg";
import csc from "@/../public/logos/csc.png";
import cscDark from "@/../public/logos/csc-dark.png";
import hplt from "@/../public/logos/hippo-logo.png";
import hpltDark from "@/../public/logos/Hippolyta-Logo-dark.svg";
import letsmt from "@/../public/logos/letsmt.png";
import letsmtDark from "@/../public/logos/lets-mt-dark.png";

export default function Partners() {
  const items = [
    {
      id: 1,
      name: "NLPL",
      light: nlpl,
      dark: nlplDark,
      url: "http://wiki.nlpl.eu/index.php/Home",
    },
    {
      id: 4,
      name: "University of Helsinki",
      light: helsinki,
      dark: helsinkiDark,
      url: "https://www.helsinki.fi/en",
    },
    {
      id: 5,
      name: "CSC",
      light: csc,
      dark: cscDark,
      url: "https://www.csc.fi/",
    },
    {
      id: 6,
      name: "HPLT",
      light: hplt,
      dark: hpltDark,
      url: "https://hplt-project.org",
    },
    {
      id: 8,
      name: "LetsMT",
      light: letsmt,
      dark: letsmtDark,
      url: "https://www.letsmt.eu/",
    },
  ];

  return (
    <section className={s.wrap}>
      {items.map(({ id, name, light, dark, url }) => (
        <Link
          key={id}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className={s.link}
        >
          <Image
            data-hide-on-theme="dark"
            src={light}
            alt={name}
            width={120}
            className={s.logo}
          />
          <Image
            data-hide-on-theme="light"
            src={dark}
            alt={name}
            width={120}
            className={s.logo}
          />
        </Link>
      ))}
    </section>
  );
}
