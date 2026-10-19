import { useId, useState, type ReactNode } from "react";
import { ExpandLessIcon, ExpandMoreIcon } from "@/icons";
import styles from "./Disclosure.module.css";

type DisclosureProps = { label: string; defaultOpen?: boolean; children: ReactNode };

/** A quiet button over a section that stays hidden until asked for. */
export const Disclosure = ({ label, defaultOpen = false, children }: DisclosureProps) => {
  const [open, setOpen] = useState(defaultOpen);
  const regionId = useId();

  return (
    <div className={styles.root}>
      <button
        type="button"
        className={styles.trigger}
        aria-expanded={open}
        aria-controls={regionId}
        onClick={() => setOpen(!open)}
      >
        {label}
        {open ? (
          <ExpandLessIcon className={styles.caret} />
        ) : (
          <ExpandMoreIcon className={styles.caret} />
        )}
      </button>
      {/* Kept mounted so aria-controls always names a live element. */}
      <div id={regionId} className={styles.region} hidden={!open}>
        {children}
      </div>
    </div>
  );
};
