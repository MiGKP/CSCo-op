export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

const STORAGE_KEY = "coop-instructor-theme";
const CHANGE_EVENT = "coop-theme-change";
const DARK_QUERY = "(prefers-color-scheme: dark)";

function isThemePreference(value: unknown): value is ThemePreference {
  return value === "light" || value === "dark" || value === "system";
}

function prefersDark(): boolean {
  return window.matchMedia(DARK_QUERY).matches;
}

export function readPreference(): ThemePreference {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return isThemePreference(stored) ? stored : "system";
  } catch {
    // Storage can be blocked; fall back to following the OS.
    return "system";
  }
}

export function resolveTheme(preference: ThemePreference): ResolvedTheme {
  if (preference === "system") {
    return prefersDark() ? "dark" : "light";
  }

  return preference;
}

function applyPreference(preference: ThemePreference): void {
  const resolved = resolveTheme(preference);
  const root = document.documentElement;

  root.dataset.theme = resolved;
  root.style.colorScheme = resolved;
}

export function setPreference(preference: ThemePreference): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, preference);
  } catch {
    // Preference just won't survive a reload; the theme still applies now.
  }

  applyPreference(preference);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/**
 * External-store plumbing for `useSyncExternalStore`. The preference lives in
 * localStorage and the DOM rather than React state, so the pre-hydration
 * bootstrap script and React can never disagree about the active theme.
 */
export function subscribeToPreference(onChange: () => void): () => void {
  const media = window.matchMedia(DARK_QUERY);

  const handleSystemChange = (): void => {
    if (readPreference() === "system") {
      applyPreference("system");
      onChange();
    }
  };

  const handleStorage = (event: StorageEvent): void => {
    if (event.key !== STORAGE_KEY) {
      return;
    }

    applyPreference(readPreference());
    onChange();
  };

  media.addEventListener("change", handleSystemChange);
  window.addEventListener("storage", handleStorage);
  window.addEventListener(CHANGE_EVENT, onChange);

  return () => {
    media.removeEventListener("change", handleSystemChange);
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

export function getPreferenceSnapshot(): ThemePreference {
  return readPreference();
}

export function getServerPreferenceSnapshot(): ThemePreference {
  return "system";
}
