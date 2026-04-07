import { Oval } from "react-loader-spinner";

import styles from "./Loader.module.css";

export default function DashboardLoader({ message }) {
  return (
    <div className={styles.loader}>
      <h2>{message}</h2>
      <Oval
        visible={true}
        height="80"
        width="80"
        color="#4fa94d"
        ariaLabel="oval-loading"
        wrapperStyle={{}}
        wrapperClass=""
      />{" "}
    </div>
  );
}
