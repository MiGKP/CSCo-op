import React, { useId } from "react";
import { IconChevronDown } from "../icons";

interface FieldChromeProps {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  hideLabel?: boolean;
  className?: string;
}

interface TextInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "className">,
    FieldChromeProps {
  leadingIcon?: React.ReactNode;
  trailing?: React.ReactNode;
  mono?: boolean;
}

interface TextAreaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "className">,
    FieldChromeProps {
  mono?: boolean;
}

interface SelectFieldProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "className">,
    FieldChromeProps {
  options: readonly SelectOption[];
}

export interface SelectOption {
  value: string;
  label: string;
}

const CONTROL =
  "w-full rounded-sm border bg-surface text-ink transition-colors duration-150 focus:border-accent focus:outline-none disabled:cursor-not-allowed disabled:bg-raised disabled:text-ink-faint";

function controlClass(hasError: boolean, extra?: string): string {
  return [
    CONTROL,
    hasError ? "border-danger" : "border-line-strong hover:border-ink/35",
    extra,
  ]
    .filter(Boolean)
    .join(" ");
}

function FieldShell({
  id,
  label,
  hint,
  error,
  required,
  hideLabel,
  className,
  children,
}: FieldChromeProps & {
  id: string;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <div className={`grid gap-1.5 ${className ?? ""}`}>
      <label
        htmlFor={id}
        className={
          hideLabel
            ? "sr-only"
            : "text-[13px] font-medium tracking-tight text-ink"
        }
      >
        {label}
        {required ? (
          <span className="ml-1 text-danger" aria-hidden="true">
            *
          </span>
        ) : null}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-xs text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-xs leading-relaxed text-ink-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function TextInput({
  label,
  hint,
  error,
  required,
  hideLabel,
  className,
  leadingIcon,
  trailing,
  mono = false,
  ...rest
}: TextInputProps): React.JSX.Element {
  const generatedId = useId();
  const id = rest.id ?? generatedId;

  return (
    <FieldShell
      id={id}
      label={label}
      hint={hint}
      error={error}
      required={required}
      hideLabel={hideLabel}
      className={className}
    >
      <div className="relative flex items-center">
        {leadingIcon ? (
          <span className="pointer-events-none absolute left-3 text-ink-faint">
            {leadingIcon}
          </span>
        ) : null}
        <input
          id={id}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={
            error ? `${id}-error` : hint ? `${id}-hint` : undefined
          }
          className={controlClass(
            Boolean(error),
            [
              "h-10 text-sm",
              leadingIcon ? "pl-9.5" : "pl-3",
              trailing ? "pr-10" : "pr-3",
              mono ? "font-mono tracking-[0.02em]" : "",
            ]
              .filter(Boolean)
              .join(" ")
          )}
          {...rest}
        />
        {trailing ? (
          <span className="absolute right-1.5 flex items-center">
            {trailing}
          </span>
        ) : null}
      </div>
    </FieldShell>
  );
}

export function TextArea({
  label,
  hint,
  error,
  required,
  hideLabel,
  className,
  mono = false,
  rows = 4,
  ...rest
}: TextAreaProps): React.JSX.Element {
  const generatedId = useId();
  const id = rest.id ?? generatedId;

  return (
    <FieldShell
      id={id}
      label={label}
      hint={hint}
      error={error}
      required={required}
      hideLabel={hideLabel}
      className={className}
    >
      <textarea
        id={id}
        rows={rows}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={
          error ? `${id}-error` : hint ? `${id}-hint` : undefined
        }
        className={controlClass(
          Boolean(error),
          `resize-y px-3 py-2.5 text-sm leading-relaxed ${
            mono ? "font-mono leading-7 tracking-[0.02em]" : ""
          }`
        )}
        {...rest}
      />
    </FieldShell>
  );
}

export function SelectField({
  label,
  hint,
  error,
  required,
  hideLabel,
  className,
  options,
  ...rest
}: SelectFieldProps): React.JSX.Element {
  const generatedId = useId();
  const id = rest.id ?? generatedId;

  return (
    <FieldShell
      id={id}
      label={label}
      hint={hint}
      error={error}
      required={required}
      hideLabel={hideLabel}
      className={className}
    >
      <div className="relative flex items-center">
        {/* Native select keeps keyboard/mobile behaviour correct; only the
            chrome is restyled and the arrow is drawn by us. */}
        <select
          id={id}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={
            error ? `${id}-error` : hint ? `${id}-hint` : undefined
          }
          className={controlClass(
            Boolean(error),
            "h-10 appearance-none pr-9 pl-3 text-sm"
          )}
          {...rest}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-3 text-ink-faint">
          <IconChevronDown />
        </span>
      </div>
    </FieldShell>
  );
}
