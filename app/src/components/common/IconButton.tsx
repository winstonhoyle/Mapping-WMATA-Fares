import type { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./IconButton.module.css";

type IconButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-label"> & {
  label: string;
  children: ReactNode;
};

export const IconButton = ({
  label,
  className,
  children,
  type = "button",
  ...props
}: IconButtonProps) => (
  <button
    type={type}
    aria-label={label}
    title={label}
    className={[styles.iconButton, className].filter(Boolean).join(" ")}
    {...props}
  >
    {children}
  </button>
);
