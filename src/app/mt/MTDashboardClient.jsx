"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

import { Repeat, Search } from "lucide-react";

import dynamic from "next/dynamic";
const MainGraph = dynamic(
  () => import("@/app/components/MT/MainGraph/MainGraph"),
);
const ModelGraph = dynamic(
  () => import("@/app/components/MT/ModelGraph/ModelGraph"),
);
import Legends from "@/app/components/MT/Legends/Legends";

import { codeToLangTransformer } from "../../../hooks/hooks";

const SizeChart = dynamic(() => import("../components/MT/SizeChart/SizeChart"));
const SingleSizeChart = dynamic(
  () => import("../components/MT/SingleSizeChart/SingleSizeChart"),
);
const DiffGraph = dynamic(() => import("../components/MT/DiffGraph/DiffGraph"));

import DashboardLoader from "../components/MT/Loader/Loader";
import DashboardBanner from "../components/MT/Banner/Banner";
import NotFoundDashboard from "../components/MT/NotFound/NotFound";

import DashboardButtons from "../components/MT/Buttons/Buttons";

import AllModelsTable from "../components/MT/AllModelsTable/AllModelsTable";
import AverageTable from "../components/MT/AverageTable/AverageTable";
import ModelTable from "../components/MT/ModelTable/ModelTable";
import TestsetTable from "../components/MT/TestsetTable/TestsetTable";
import SourceTable from "../components/MT/SourceTable/SourceTable";

import SelectField from "../components/ui/SelectField/SelectField";

import s from "./page.module.css";

function buildMtHref({ source, target, score, benchmark, model }) {
  const sp = new URLSearchParams({
    source: source ?? "",
    target: target ?? "",
    score: score ?? "",
    benchmark: benchmark ?? "",
    model: model ?? "",
  });

  return `/mt?${sp.toString()}`;
}

async function safeReadJsonOrText(res) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export default function MTDashboardClient({ sourceData, targetData }) {
  const searchParams = useSearchParams();

  // Canonical URL state (required in your “real” usage)
  const originLang = searchParams.get("source") ?? "";
  const targetLang = searchParams.get("target") ?? "";
  const scoreInfo = searchParams.get("score") ?? "";
  const benchmarkInfo = searchParams.get("benchmark") ?? "";
  const modelInfoRaw = searchParams.get("model") ?? "";

  // Accept both new (/) and legacy (%2F) model spellings
  const modelInfo = (modelInfoRaw || "").replaceAll("%2F", "/");

  // UI state (kept very close to your original)
  const [origin, setOrigin] = useState("");
  const [target, setTarget] = useState("");
  const [score, setScore] = useState("");
  const [data, setData] = useState("Loading");
  const [originValue, setOriginValue] = useState("");
  const [targetValue, setTargetValue] = useState("");
  const [benchmark, setBenchmark] = useState("");
  const [modelType, setModelType] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const sourceLangs = useMemo(() => {
    return mounted ? codeToLangTransformer(sourceData) : [];
  }, [mounted, sourceData]);

  const targetLangs = useMemo(() => {
    return mounted
      ? codeToLangTransformer((targetData ?? []).filter(Boolean))
      : [];
  }, [mounted, targetData]);

  async function getData(
    originParam,
    targetParam,
    scoreParam,
    benchmarkParam,
    modelParam,
  ) {
    const url = `/api/dashboardStats/${originParam}&${targetParam}&${scoreParam}&${benchmarkParam}&${encodeURIComponent(
      modelParam,
    )}`;

    try {
      const res = await fetch(url, { cache: "no-store" });

      // Your old code relied on “body is 404” sometimes; we support both patterns.
      const payload = await safeReadJsonOrText(res);

      if (payload === 404 || payload === "404") {
        setData(404);
        return;
      }

      setData(payload);
    } catch (e) {
      console.error(e);
      setData(404);
    }
  }

  // Sync URL → local state, then fetch (URL is the source of truth)
  useEffect(() => {
    // If someone lands on /mt without params, behave like your old “info” case:
    // don’t fetch until params exist.
    const hasAllParams =
      !!originLang &&
      !!targetLang &&
      !!scoreInfo &&
      !!benchmarkInfo &&
      !!modelInfo;

    // hydrate dropdown display values
    if (originLang && targetLang) {
      const formatted = codeToLangTransformer([originLang, targetLang]);
      if (formatted?.[0]) {
        setOrigin(formatted[0].value);
        setOriginValue(formatted[0].label);
      }
      if (formatted?.[1]) {
        setTarget(formatted[1].value);
        setTargetValue(formatted[1].label);
      }
    }

    if (scoreInfo) {
      setScore(scoreInfo);
    }
    if (benchmarkInfo) {
      setBenchmark(benchmarkInfo);
    }
    if (modelInfo) {
      setModelType(modelInfo);
    }

    if (!hasAllParams) return;

    setData("Loading");
    void getData(originLang, targetLang, scoreInfo, benchmarkInfo, modelInfo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [originLang, targetLang, scoreInfo, benchmarkInfo, modelInfoRaw]);

  // Filtering logic preserved
  const filteredData = useMemo(() => {
    if (!data?.cleanData) return "";
    return data.cleanData.filter((i) =>
      modelType === "all"
        ? i
        : modelType === "opus"
          ? i.catalog === "OPUS"
          : modelType === "external"
            ? i.catalog === "External"
            : i.catalog === "Contributed",
    );
  }, [data, modelType]);

  const isLoading = data === "Loading";
  const is404 = data === 404;
  const hasClean = !!data?.cleanData?.length;

  const searchHref = buildMtHref({
    source: origin,
    target,
    score,
    benchmark,
    model: modelType, // query params can safely contain "/" (will be encoded)
  });

  const swapHref = buildMtHref({
    source: target,
    target: origin,
    score,
    benchmark,
    model: modelType,
  });

  return (
    <div>
      <DashboardBanner />

      <div className={s.opusMTBody}>
        <div className={s.dashboardControls}>
          <DashboardButtons
            origin={origin}
            target={target}
            score={score}
            benchmark={benchmark}
            modelType={modelType}
          />

          <div className={s.lowerButtons}>
            <SelectField
              label="Source language"
              value={origin}
              onChange={(v) => setOrigin(v)}
              options={sourceLangs}
              placeholder="Select source"
            />

            <SelectField
              label="Target language"
              value={target}
              onChange={(v) => setTarget(v)}
              options={targetLangs}
              placeholder="Select target"
            />
            <div className={s.searchButtons}>
              <Link className={s.searchButton} href={searchHref}>
                <Search className={s.searchIcon} size={20} />
              </Link>

              <div className={s.swapBtnContainer}>
                <p className={s.optionsLabel}>Swap</p>
                <Link href={swapHref} className={s.swapBtn}>
                  <Repeat
                    color={"#ee5e89ff"}
                    strokeWidth={"1.6px"}
                    width={19}
                  />
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className={s.graphMsgContainer}>
          {isLoading && <DashboardLoader message={"Preparing data..."} />}

          {!isLoading &&
            (is404 || (modelType === "all" && !data?.cleanData?.length)) && (
              <NotFoundDashboard />
            )}
        </div>

        {/* Display all models + all benchmarks */}
        {!is404 &&
        !isLoading &&
        benchmark === "all" &&
        modelType === "all" &&
        hasClean ? (
          <div className={s.mainContainerAll}>
            <div className={s.graphsAndContributed}>
              <div className={s.graphContainerContributed}>
                <MainGraph
                  values={data.cleanData}
                  score={score}
                  modelType={modelType}
                  benchmark={benchmark}
                />
              </div>

              {data.cleanData.some((el) => el.size) && (
                <div className={s.graphContainerContributed}>
                  <SizeChart
                    data={data.cleanData}
                    score={score}
                    modelType={modelType}
                    benchmark={benchmark}
                  />
                </div>
              )}

              {modelType === "all" && (
                <div className={s.graphContainerContributed}>
                  <DiffGraph
                    values={data.cleanData}
                    score={score}
                    modelType={modelType}
                    benchmark={benchmark}
                  />
                </div>
              )}
            </div>

            {modelType === "all" && (
              <Legends data={data.cleanData} modelType={modelType} />
            )}

            <div className={s.tableContainerCont}>
              <AllModelsTable
                modelType={modelType}
                score={score}
                origin={origin}
                target={target}
                benchmark={benchmark}
                data={data}
              />
            </div>
          </div>
        ) : (
          ""
        )}

        {/* Display scores for opus/external/contributed */}
        {!is404 &&
        !isLoading &&
        benchmark === "all" &&
        modelType !== "all" &&
        hasClean ? (
          <>
            <Legends data={data.cleanData} modelType={modelType} />
            <div className={s.mainContainer}>
              <div className={s.graphs}>
                <ModelGraph
                  dashboardValues={data.cleanData}
                  modelType={modelType}
                  benchmark={benchmark}
                  score={score}
                />

                {data.cleanData.some((el) => el.size) && (
                  <SizeChart
                    data={data.cleanData}
                    score={score}
                    modelType={modelType}
                    benchmark={benchmark}
                  />
                )}
              </div>

              <div className={s.tableContainerTwo}>
                <SourceTable
                  score={score}
                  modelType={modelType}
                  origin={origin}
                  target={target}
                  data={data}
                />
              </div>
            </div>
          </>
        ) : (
          ""
        )}

        {/* Display average scores */}
        {!is404 && !isLoading && benchmark === "avg" && filteredData ? (
          <>
            <Legends data={filteredData} modelType={modelType} />
            <div className={s.mainContainer}>
              <div className={s.graphs}>
                <ModelGraph
                  dashboardValues={filteredData}
                  modelType={modelType}
                  benchmark={benchmark}
                  score={score}
                />

                {filteredData.some((el) => el.size) && (
                  <SingleSizeChart
                    data={filteredData}
                    score={score}
                    modelType={modelType}
                    benchmark={benchmark}
                  />
                )}
              </div>

              <div className={s.tableContainerTwo}>
                <AverageTable
                  data={data}
                  score={score}
                  modelType={modelType}
                  origin={origin}
                  target={target}
                />
              </div>
            </div>
          </>
        ) : (
          ""
        )}

        {/* Display models available for one benchmark */}
        {!is404 &&
        !isLoading &&
        benchmark &&
        benchmark !== "avg" &&
        benchmark !== "all" &&
        benchmark !== "none" &&
        filteredData.length ? (
          <div className={s.modelResults}>
            <h3>{`Model scores in the ${benchmark} testset`}</h3>

            <Legends data={filteredData} modelType={modelType} />

            <div className={s.mainContainer}>
              <div className={s.graphs}>
                <ModelGraph
                  dashboardValues={filteredData}
                  score={score}
                  modelType={modelType}
                  benchmark={benchmark}
                />

                {data.cleanData.some((el) => el.size) && (
                  <SingleSizeChart
                    data={filteredData}
                    score={score}
                    modelType={modelType}
                    benchmark={benchmark}
                  />
                )}
              </div>

              <div className={s.tableContainerTwo}>
                <TestsetTable
                  score={score}
                  tableData={data}
                  modelType={modelType}
                  benchmark={benchmark}
                  origin={origin}
                  target={target}
                />
              </div>
            </div>
          </div>
        ) : (
          <>
            {data &&
              !isLoading &&
              !is404 &&
              benchmark !== "avg" &&
              benchmark !== "all" &&
              benchmark !== "none" &&
              !filteredData.length && <NotFoundDashboard />}
          </>
        )}

        {/* Display benchmarks for one model */}
        {!is404 && !isLoading && benchmark === "none" && data?.cleanData ? (
          <div className={s.modelResults}>
            <h3>Benchmarks for {modelType.replaceAll("%2F", "/")}</h3>

            <Legends data={data.cleanData} modelType={modelType} />

            <div className={s.benchmarkResultsContainer}>
              <div className={s.graphsLast}>
                <ModelGraph
                  dashboardValues={data.cleanData}
                  score={score}
                  modelType={modelType}
                  benchmark={benchmark}
                />
              </div>

              <div className={s.tableContainerThree}>
                <ModelTable
                  score={score}
                  modelType={modelType}
                  origin={origin}
                  target={target}
                  tableData={data}
                />
              </div>
            </div>
          </div>
        ) : (
          <>
            {!is404 &&
              !isLoading &&
              benchmark === "none" &&
              data?.cleanData && <NotFoundDashboard />}
          </>
        )}
      </div>
    </div>
  );
}
