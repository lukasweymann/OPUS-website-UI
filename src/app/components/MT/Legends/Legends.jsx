import styles from "./Legends.module.css";

const hasCatalog = (data, catalog) =>
  data?.some((el) => el?.catalog === catalog);
const hasNested = (data, key) => data?.some((el) => el?.[key]);
const hasHPLT = (data) =>
  data?.some(
    (el) => typeof el?.model === "string" && el.model.includes("HPLT")
  );

export default function Legends({ data = [], modelType }) {
  const showOpus = modelType === "all" || hasCatalog(data, "OPUS");
  const showExternal =
    (modelType === "all" && hasNested(data, "external")) ||
    hasCatalog(data, "External");
  const showContributed =
    (modelType === "all" && hasNested(data, "contributed")) ||
    hasCatalog(data, "Contributed");
  const showHplt = hasHPLT(data);

  return (
    <div className={styles.container}>
      {showOpus ? (
        <div className={styles.item}>
          <span className={`${styles.swatch} ${styles.opus}`} />
          <p>OPUS</p>
        </div>
      ) : null}

      {showExternal ? (
        <div className={styles.item}>
          <span className={`${styles.swatch} ${styles.external}`} />
          <p>External</p>
        </div>
      ) : null}

      {showHplt ? (
        <div className={styles.item}>
          <span className={`${styles.swatch} ${styles.hplt}`} />
          <p>HPLT</p>
        </div>
      ) : null}

      {showContributed ? (
        <div className={styles.item}>
          <span className={`${styles.swatch} ${styles.contributed}`} />
          <p>Contributed</p>
        </div>
      ) : null}
    </div>
  );
}
