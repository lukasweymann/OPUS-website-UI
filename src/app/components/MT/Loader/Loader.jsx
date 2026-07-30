import LoaderSpinner from "../../ui/LoaderSpinner/LoaderSpinner";
import styles from "./Loader.module.css";

export default function DashboardLoader({ message }) {
  return (
    <div className={styles.loader}>
      <h2>{message}</h2>
      <LoaderSpinner size={72} label={message || "Loading"} />
    </div>
  );
}
