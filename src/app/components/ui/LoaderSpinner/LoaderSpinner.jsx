import s from "./LoaderSpinner.module.css";

export default function LoaderSpinner({
  label = "Loading",
  size = 64,
  className = "",
  decorative = false,
}) {
  const spinnerSize = typeof size === "number" ? `${size}px` : size;
  const spinnerStroke = typeof size === "number" && size < 28 ? "2px" : "6px";
  const spinnerGlow = typeof size === "number" && size < 28 ? "2px" : "7px";
  const spinnerShadow = typeof size === "number" && size < 28 ? "2px" : "8px";
  const classes = [s.spinner, className].filter(Boolean).join(" ");

  return (
    <span
      className={classes}
      role={decorative ? undefined : "status"}
      aria-hidden={decorative ? "true" : undefined}
      aria-label={decorative ? undefined : label}
      style={{
        "--spinner-size": spinnerSize,
        "--spinner-stroke": spinnerStroke,
        "--spinner-glow": spinnerGlow,
        "--spinner-shadow": spinnerShadow,
      }}
    >
      <span className={s.track} aria-hidden="true" />
      <span className={s.core} aria-hidden="true" />
      {decorative ? null : <span className={s.srOnly}>{label}</span>}
    </span>
  );
}
