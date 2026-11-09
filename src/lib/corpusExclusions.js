const EXCLUDED_CORPORA = new Set([
  "komi",
  "mpc1",
  "un",
  "elra-w0245",
  "elra-w0248",
  "elrc_416",
]);

export function isExcludedCorpus(corpus) {
  return EXCLUDED_CORPORA.has(String(corpus ?? "").toLowerCase());
}
