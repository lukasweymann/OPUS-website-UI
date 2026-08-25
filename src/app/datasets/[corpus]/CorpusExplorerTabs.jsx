"use client";

import { useId, useState } from "react";

import LanguageGraphs from "@/app/components/Dataset/LanguageGraph/LanguageGraph";
import SmallCorpusResources from "./SmallCorpusResources";
import CorpusMatrix from "./CorpusMatrix";
import s from "./CorpusExplorerTabs.module.css";

export default function CorpusExplorerTabs({
  corpus,
  graphValues = [],
  matrix = null,
  resources = [],
}) {
  const tabsId = useId();
  const hasGraph = Array.isArray(graphValues) && graphValues.length > 0;
  const hasResources = Array.isArray(resources) && resources.length > 0;
  const hasMatrix = Boolean(matrix?.languages?.length && matrix?.cells?.length);
  const primary = hasResources ? "resources" : "graph";
  const [active, setActive] = useState(hasMatrix ? "matrix" : primary);
  const showTabs = hasMatrix && (hasGraph || hasResources);

  if (!showTabs) {
    if (hasResources) return <SmallCorpusResources resources={resources} />;
    if (hasGraph) return <LanguageGraphs graphValues={graphValues} />;
    if (hasMatrix) return <CorpusMatrix corpus={corpus} matrix={matrix} />;
    return null;
  }

  const primaryLabel = hasResources ? "Resources" : "Graph";
  const orderedTabs = [primary, "matrix"];

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
        <h2 id={`${tabsId}-title`}>Language pairs</h2>
        <div
          className={s.tabs}
          role="tablist"
          aria-label="Language pair views"
          onKeyDown={onTabsKeyDown}
        >
          <button
            type="button"
            role="tab"
            id={`${tabsId}-primary-tab`}
            aria-selected={active === primary}
            aria-controls={`${tabsId}-primary-panel`}
            className={`${s.tab} ${active === primary ? s.active : ""}`}
            onClick={() => setActive(primary)}
          >
            {primaryLabel}
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
        id={`${tabsId}-primary-panel`}
        aria-labelledby={`${tabsId}-primary-tab`}
        hidden={active !== primary}
      >
        {active === primary ? (
          hasResources ? (
            <SmallCorpusResources resources={resources} />
          ) : (
            <LanguageGraphs graphValues={graphValues} />
          )
        ) : null}
      </div>

      <div
        role="tabpanel"
        id={`${tabsId}-matrix-panel`}
        aria-labelledby={`${tabsId}-matrix-tab`}
        hidden={active !== "matrix"}
      >
        {active === "matrix" ? (
          <CorpusMatrix corpus={corpus} matrix={matrix} />
        ) : null}
      </div>
    </section>
  );
}
