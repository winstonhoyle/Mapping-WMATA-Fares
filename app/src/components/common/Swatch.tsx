import styles from "./Swatch.module.css";

/** A round color key, as the map draws a station. */
export const Swatch = ({ token, className }: { token: `--${string}`; className?: string }) => (
  <span
    className={[styles.swatch, className].filter(Boolean).join(" ")}
    style={{ background: `var(${token})` }}
    aria-hidden
  />
);
