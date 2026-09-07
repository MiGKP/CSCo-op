import React from "react";
import { IconAlert, IconCheckCircle, IconInfo } from "../icons";

export type Tone = "neutral" | "accent" | "success" | "warning" | "danger";

interface SpinnerProps {
  className?: string;
  label?: string;
}

interface AlertProps {
  tone: Exclude<Tone, "neutral" | "accent">;
  title?: string;
  children: React.ReactNode;
}

interface BadgeProps {
  tone?: Tone;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export function Spinner({ className, label }: SpinnerProps): React.JSX.Element {
  return (
    <span className="inline-flex items-center gap-2">
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        focusable="false"
        className={`size-[1.15em] shrink-0 animate-spin ${className ?? ""}`}
      >
        <circle
          cx="12"
          cy="12"
          r="9"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeDasharray="44"
          strokeDashoffset="14"
          opacity={0.9}
        />
      </svg>
      {label ? <span className="text-sm text-ink-muted">{label}</span> : null}
      <span className="sr-only">กำลังทำงาน</span>
    </span>
  );
}

const ALERT_TONES: Record<AlertProps["tone"], string> = {
  success: "border-success/35 bg-success-soft text-success",
  warning: "border-warning/35 bg-warning-soft text-warning",
  danger: "border-danger/35 bg-danger-soft text-danger",
};

const ALERT_ICONS: Record<AlertProps["tone"], React.JSX.Element> = {
  success: <IconCheckCircle />,
  warning: <IconAlert />,
  danger: <IconAlert />,
};

export function Alert({ tone, title, children }: AlertProps): React.JSX.Element {
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={`flex items-start gap-3 rounded-sm border px-4 py-3 text-sm ${ALERT_TONES[tone]}`}
    >
      <span className="mt-0.5 text-[15px]">{ALERT_ICONS[tone]}</span>
      <div className="min-w-0">
        {title ? <strong className="block font-semibold">{title}</strong> : null}
        <span className="block text-ink">{children}</span>
      </div>
    </div>
  );
}

const BADGE_TONES: Record<Tone, string> = {
  neutral: "border-line bg-raised text-ink-muted",
  accent: "border-accent/25 bg-accent-soft text-accent",
  success: "border-success/30 bg-success-soft text-success",
  warning: "border-warning/30 bg-warning-soft text-warning",
  danger: "border-danger/30 bg-danger-soft text-danger",
};

export function Badge({
  tone = "neutral",
  icon,
  children,
}: BadgeProps): React.JSX.Element {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs whitespace-nowrap ${BADGE_TONES[tone]}`}
    >
      {icon}
      {children}
    </span>
  );
}

export function InfoNote({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <p className="flex items-start gap-2 text-[13px] leading-relaxed text-ink-muted">
      <span className="mt-0.5 text-ink-faint">
        <IconInfo />
      </span>
      <span>{children}</span>
    </p>
  );
}
