import Link from "next/link";
import styles from "./not-found.module.css";

const QUICK_LINKS = [
  { href: "/corpora", label: "Browse corpora" },
  { href: "/synthetic", label: "Synthetic corpora" },
  {
    href: "/mt?source=eng&target=fra&score=spbleu&benchmark=all&model=all",
    label: "MT dashboard",
  },
  { href: "/opusapi", label: "API docs" },
];

export default function NotFound() {
  return (
    <main className={styles.page}>
      <section className={styles.hero} aria-labelledby="not-found-title">
        <p className={styles.kicker}>404</p>
        <h1 id="not-found-title">This text pair did not align.</h1>
        <p className={styles.copy}>
          The page you requested is missing, moved, or waiting for a better
          sentence match. The corpus is still very much alive.
        </p>

        <div className={styles.actions} aria-label="Recovery actions">
          <Link className={styles.primary} href="/">
            Go home
          </Link>
          <Link className={styles.secondary} href="/corpora">
            Find corpora
          </Link>
        </div>
      </section>

      <nav className={styles.links} aria-label="Helpful destinations">
        <p className={styles.linksTitle}>Try one of these instead</p>
        {QUICK_LINKS.map(({ href, label }) => (
          <Link key={href} href={href} className={styles.quickLink}>
            <span>{label}</span>
            <span aria-hidden="true">-&gt;</span>
          </Link>
        ))}
      </nav>
    </main>
  );
}
