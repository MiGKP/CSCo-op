import Link from "next/link";
import React from "react";
import { Spinner } from "./feedback";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger"
  | "quiet";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonStyleOptions {
  variant?: ButtonVariant;
  size?: ButtonSize;
  iconOnly?: boolean;
  className?: string;
}

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    ButtonStyleOptions {
  icon?: React.ReactNode;
  iconAfter?: React.ReactNode;
  loading?: boolean;
  // React 19 passes `ref` to function components as a normal prop.
  ref?: React.Ref<HTMLButtonElement>;
}

interface LinkButtonProps
  extends Omit<React.ComponentProps<typeof Link>, "className">,
    ButtonStyleOptions {
  icon?: React.ReactNode;
  iconAfter?: React.ReactNode;
}

const BASE =
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-sm border font-medium leading-none whitespace-nowrap no-underline transition-colors duration-150 select-none disabled:pointer-events-none disabled:opacity-45 aria-disabled:pointer-events-none aria-disabled:opacity-45";

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "border-primary bg-primary text-primary-ink hover:border-primary-hover hover:bg-primary-hover",
  secondary:
    "border-line-strong bg-surface text-ink hover:border-accent/45 hover:bg-accent-soft hover:text-accent",
  ghost: "border-transparent bg-transparent text-ink-muted hover:bg-raised hover:text-ink",
  danger: "border-danger bg-danger text-surface hover:bg-danger/85",
  quiet:
    "border-transparent bg-transparent text-accent underline-offset-4 hover:underline",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "h-8 px-2.5 text-[13px]",
  md: "h-9.5 px-3.5 text-[13.5px]",
  lg: "h-11 px-5 text-[15px]",
};

const ICON_ONLY_SIZES: Record<ButtonSize, string> = {
  sm: "h-8 w-8 px-0",
  md: "h-9.5 w-9.5 px-0",
  lg: "h-11 w-11 px-0",
};

function buttonClass({
  variant = "secondary",
  size = "md",
  iconOnly = false,
  className,
}: ButtonStyleOptions): string {
  return [
    BASE,
    VARIANTS[variant],
    iconOnly ? ICON_ONLY_SIZES[size] : SIZES[size],
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export function Button({
  variant,
  size,
  iconOnly,
  className,
  icon,
  iconAfter,
  loading = false,
  disabled,
  children,
  type = "button",
  ...rest
}: ButtonProps): React.JSX.Element {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={buttonClass({ variant, size, iconOnly, className })}
      {...rest}
    >
      {loading ? <Spinner /> : icon}
      {children}
      {!loading && iconAfter}
    </button>
  );
}

export function LinkButton({
  variant,
  size,
  iconOnly,
  className,
  icon,
  iconAfter,
  children,
  ...rest
}: LinkButtonProps): React.JSX.Element {
  return (
    <Link
      className={buttonClass({ variant, size, iconOnly, className })}
      {...rest}
    >
      {icon}
      {children}
      {iconAfter}
    </Link>
  );
}
