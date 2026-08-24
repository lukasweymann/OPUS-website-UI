"use client";

import { useId, useState } from "react";

import LanguageGraphsSynthetic from "@/app/components/Synthetic/LanguageGraph/LanguageGraph";
import SyntheticMatrix from "./SyntheticMatrix";
import s from "./SyntheticExplorerTabs.module.css";

export default function SyntheticExplorerTabs({
  graphValues = [],
  matrixRows = [],
  title = "Language pairs",
}) {
  const tabsId = useId();
  const hasGraph = Array.isArray(graphValues) && graphValues.length > 0;
  const hasMatrix = Array.isArray(matrixRows) && matrixRows.length > 0;
  const [active, setActive] = useState("graph");
  const showTabs = hasGraph && hasMatrix;
  const orderedTabs = ["graph", "matrix"];

  if (!showTabs) {
    if (hasGraph) return <LanguageGraphsSynthetic graphValues={graphValues} />;
    if (hasMatrix) return <SyntheticMatrix rows={matrixRows} />;
    return null;
  }

  function onTabsKeyDown(event) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
      return;
    }

    event.preventDefault();
    if (event.key === "Home") {
      setActive(orderedTabs[0]);
      return;
    }
    if (event.key === "End") {
      setActive(orderedTabs[orderedTabs.length - 1]);
      return;
    }

    const currentIndex = orderedTabs.indexOf(active);
    const offset = event.key === "ArrowRight" ? 1 : -1;
    const nextIndex =
      (currentIndex + offset + orderedTabs.length) % orderedTabs.length;
    setActive(orderedTabs[nextIndex]);
  }

  return (
    <section className={s.wrap} aria-labelledby={`${tabsId}-title`}>
      <div className={s.head}>
        <h2 id={`${tabsId}-title`}>{title}</h2>
        <div
          className={s.tabs}
          role="tablist"
          aria-label="Synthetic language pair views"
          onKeyDown={onTabsKeyDown}
        >
          <button
            type="button"
            role="tab"
            id={`${tabsId}-graph-tab`}
            aria-selected={active === "graph"}
            aria-controls={`${tabsId}-graph-panel`}
            className={`${s.tab} ${active === "graph" ? s.active : ""}`}
            onClick={() => setActive("graph")}
          >
            Graph
          </button>
          <button
            type="button"
            role="tab"
            id={`${tabsId}-matrix-tab`}
            aria-selected={active === "matrix"}
            aria-controls={`${tabsId}-matrix-panel`}
            className={`${s.tab} ${active === "matrix" ? s.active : ""}`}
            onClick={() => setActive("matrix")}
          >
            Matrix
          </button>
        </div>
      </div>

      <div
        role="tabpanel"
        id={`${tabsId}-graph-panel`}
        aria-labelledby={`${tabsId}-graph-tab`}
        hidden={active !== "graph"}
      >
        {active === "graph" ? (
          <LanguageGraphsSynthetic graphValues={graphValues} />
        ) : null}
      </div>

      <div
        role="tabpanel"
        id={`${tabsId}-matrix-panel`}
        aria-labelledby={`${tabsId}-matrix-tab`}
        hidden={active !== "matrix"}
      >
        {active === "matrix" ? <SyntheticMatrix rows={matrixRows} /> : null}
      </div>
    </section>
  );
}
