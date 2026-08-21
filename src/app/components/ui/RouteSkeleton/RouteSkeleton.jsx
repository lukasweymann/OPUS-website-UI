import s from "./RouteSkeleton.module.css";

function classes(...names) {
  return names.filter(Boolean).join(" ");
}

export function Line({ width = "100%" }) {
  return <span className={s.line} style={{ "--w": width }} />;
}

export function Block({ children, className = "" }) {
  return <section className={classes(s.card, className)}>{children}</section>;
}

export function Controls({ count = 3 }) {
  return (
    <div className={s.toolbar}>
      {Array.from({ length: count }).map((_, index) => (
        <span key={index} className={index === count - 1 ? s.button : s.pill} />
      ))}
    </div>
  );
}

export function Chart({ bars = 18 }) {
  return (
    <div className={s.chart}>
      {Array.from({ length: bars }).map((_, index) => (
        <span
          key={index}
          className={s.bar}
          style={{ "--h": `${28 + ((index * 19) % 64)}%` }}
        />
      ))}
    </div>
  );
}

export function Table({ rows = 6, columns = 3 }) {
  return (
    <div className={s.table}>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className={s.tableRow}
          style={{ "--cols": columns }}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Line
              key={colIndex}
              width={
                colIndex === 0 ? (rowIndex % 2 ? "56%" : "42%") : "68%"
              }
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function List({ rows = 6 }) {
  return (
    <div className={s.list}>
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className={s.listRow}>
          <Line width={index % 2 ? "72%" : "54%"} />
          <Line width={index % 2 ? "42%" : "32%"} />
        </div>
      ))}
    </div>
  );
}

export function Samples({ rows = 6 }) {
  return (
    <div className={s.samples}>
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className={s.sample}>
          <Line width={index % 2 ? "82%" : "64%"} />
          <Line width={index % 2 ? "70%" : "88%"} />
        </div>
      ))}
    </div>
  );
}

export function Split({ left, right }) {
  return (
    <div className={s.split}>
      <div>{left}</div>
      <div>{right}</div>
    </div>
  );
}

export default function RouteSkeleton({ label = "Loading page", children }) {
  return (
    <main className={s.wrap} aria-busy="true" aria-label={label}>
      {children}
    </main>
  );
}
