import s from "./loading.module.css";

function Line({ width = "100%" }) {
  return <span className={s.line} style={{ "--w": width }} />;
}

function MiniCard() {
  return (
    <div className={s.miniCard}>
      <Line width="34%" />
      <Line width="72%" />
    </div>
  );
}

export default function DatasetLoading() {
  return (
    <main className={s.wrap} aria-busy="true" aria-label="Loading dataset">
      <section className={s.card}>
        <div className={s.headerRow}>
          <span className={s.pill} />
          <span className={s.button} />
        </div>
        <Line width="42%" />
        <Line width="68%" />
        <Line width="58%" />
        <div className={s.metaGrid}>
          <MiniCard />
          <MiniCard />
        </div>
      </section>

      <section className={s.card}>
        <Line width="28%" />
        <div className={s.table}>
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className={s.tableRow}>
              <Line width={index % 2 ? "42%" : "34%"} />
              <Line width="22%" />
              <Line width="16%" />
            </div>
          ))}
        </div>
      </section>

      <section className={s.card}>
        <Line width="36%" />
        <Line width="48%" />
        <div className={s.chart}>
          {Array.from({ length: 18 }).map((_, index) => (
            <span
              key={index}
              className={s.bar}
              style={{ "--h": `${28 + ((index * 19) % 64)}%` }}
            />
          ))}
        </div>
      </section>

      <section className={s.card}>
        <Line width="24%" />
        <Line width="46%" />
        <span className={s.select} />
        <Line width="76%" />
      </section>
    </main>
  );
}
