import styles from "./SegmentedControl.module.css";

type Option<T extends string> = { value: T; label: string };

type SegmentedControlProps<T extends string> = {
  legend: string;
  hideLegend?: boolean;
  name: string;
  options: readonly Option<T>[];
  value: T;
  onChange: (value: T) => void;
};

/** Native radios drawn as joined buttons, so arrow keys and screen readers work as usual. */
export const SegmentedControl = <T extends string>({
  legend,
  hideLegend,
  name,
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) => (
  <fieldset className={styles.control}>
    <legend className={hideLegend ? "visually-hidden" : styles.legend}>{legend}</legend>
    <div className={styles.options}>
      {options.map((o) => (
        <label key={o.value} className={styles.option}>
          <input
            type="radio"
            name={name}
            value={o.value}
            checked={value === o.value}
            onChange={() => onChange(o.value)}
          />
          {o.label}
        </label>
      ))}
    </div>
  </fieldset>
);
