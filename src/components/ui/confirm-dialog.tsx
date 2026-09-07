"use client";

import React, { useEffect, useRef } from "react";
import { Button } from "./button";
import { Alert } from "./feedback";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: React.ReactNode;
  confirmLabel: string;
  pendingLabel: string;
  cancelLabel?: string;
  destructive?: boolean;
  pending?: boolean;
  errorMessage?: string | null;
  confirmIcon?: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Rendered inline with `position: fixed` rather than through a portal. Nothing
 * is appended to <body> and the document is never resized, so opening the
 * dialog cannot shift or repaint the page behind it.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  pendingLabel,
  cancelLabel = "ยกเลิก",
  destructive = false,
  pending = false,
  errorMessage = null,
  confirmIcon,
  onConfirm,
  onCancel,
}: ConfirmDialogProps): React.JSX.Element | null {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    cancelRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape" && !pending) {
        onCancel();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, pending, onCancel]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label={cancelLabel}
        tabIndex={-1}
        className="absolute inset-0 h-full w-full cursor-default bg-ink/35"
        onClick={() => {
          if (!pending) {
            onCancel();
          }
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="relative w-full max-w-md overscroll-contain rounded-md border border-line bg-surface p-6 shadow-[0_16px_48px_rgb(20_20_18/18%)]"
      >
        <h2
          id="confirm-dialog-title"
          className="display text-xl text-ink"
        >
          {title}
        </h2>
        <div className="mt-2 text-sm leading-relaxed text-ink-muted">
          {description}
        </div>

        {errorMessage ? (
          <div className="mt-4">
            <Alert tone="danger">{errorMessage}</Alert>
          </div>
        ) : null}

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            ref={cancelRef}
            variant="secondary"
            disabled={pending}
            onClick={onCancel}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={destructive ? "danger" : "primary"}
            loading={pending}
            icon={confirmIcon}
            onClick={onConfirm}
          >
            {pending ? pendingLabel : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
