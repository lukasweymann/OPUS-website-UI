import CorpusReleasePage from "../CorpusReleasePage";
import { callPythonReadData } from "@/lib/pythonClient";
import { isExcludedCorpus } from "@/lib/corpusExclusions";

export const dynamicParams = true;

export async function generateStaticParams() {
  const response = await callPythonReadData({ versions: "True" });
  const releases = Array.isArray(response?.versions) ? response.versions : [];
  return releases
    .filter((release) => !release.latest && release.corpus && release.version && !isExcludedCorpus(release.corpus))
    .map(({ corpus, version }) => ({ corpus, version }));
}

export default async function CorpusVersionPage({ params }) {
  const { corpus, version } = await params;
  return <CorpusReleasePage corpus={corpus} requestedVersion={version} />;
}
