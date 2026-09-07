"use client";

import React, { useSyncExternalStore } from "react";
import { IconMonitor, IconMoon, IconSun } from "./icons";
import {
  getPreferenceSnapshot,
  getServerPreferenceSnapshot,
  setPreference,
  subscribeToPreference,
  type ThemePreference,
} from "./theme";
import { Tooltip } from "./ui/tooltip";

interface ThemeOption {
  value: ThemePreference;
  label: string;
  icon: React.JSX.Element;
}

const THEME_OPTIONS: ThemeOption[] = [
  { value: "light", label: "ธีมสว่าง", icon: <IconSun /> },
  { value: "dark", label: "ธีมมืด", icon: <IconMoon /> },
  { value: "system", label: "ตามระบบ", icon: <IconMonitor /> },
];

export function ThemeSelect(): React.JSX.Element {
  const preference = useSyncExternalStore(
    subscribeToPreference,
    getPreferenceSnapshot,
    getServerPreferenceSnapshot
  );

  return (
    <div className="flex items-center gap-2">
      <span className="hidden text-[11px] font-medium tracking-wide text-ink-faint lg:inline">
        ธีม
      </span>
      <div
        role="group"
        aria-label="ธีมการแสดงผล"
        className="inline-flex items-center gap-0.5 rounded-sm border border-line bg-raised p-0.5"
      >
      {THEME_OPTIONS.map((option) => {
        const selected = preference === option.value;

        return (
          <Tooltip key={option.value} label={option.label} placement="top">
            <button
              type="button"
              aria-label={option.label}
              aria-pressed={selected}
              onClick={() => setPreference(option.value)}
              className={`flex size-7 items-center justify-center rounded-xs text-[13px] transition-colors duration-150 ${
                selected
                  ? "bg-surface text-accent shadow-[0_1px_1px_rgb(21_24_30/8%)]"
                  : "text-ink-faint hover:text-ink"
              }`}
            >
              {option.icon}
            </button>
          </Tooltip>
        );
        })}
      </div>
    </div>
  );
}
