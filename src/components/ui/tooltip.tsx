import React from "react";

interface TooltipProps {
  label: string;
  placement?: "top" | "bottom";
  children: React.ReactNode;
}

/**
 * CSS-only tooltip. Deliberately not portalled: a portalled tooltip inherits
 * whatever styling the portal host applies and can repaint or resize the page
 * on hover. This one is absolutely positioned and pointer-transparent, so it
 * never affects layout.
 */
export function Tooltip({
  label,
  placement = "bottom",
  children,
}: TooltipProps): React.JSX.Element {
  return (
    <span className="group relative inline-flex">
      {children}
      <span
        role="tooltip"
        className={`pointer-events-none absolute left-1/2 z-40 -translate-x-1/2 rounded-sm border border-line bg-surface px-2 py-1 text-xs whitespace-nowrap text-ink opacity-0 shadow-[0_1px_2px_rgb(0_0_0/6%)] transition-opacity duration-100 group-hover:opacity-100 group-focus-within:opacity-100 ${
          placement === "top" ? "bottom-full mb-1.5" : "top-full mt-1.5"
        }`}
      >
        {label}
      </span>
    </span>
  );
}
