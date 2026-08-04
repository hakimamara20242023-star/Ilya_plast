"use client";

const STORAGE_KEY = "ilyaplast_utm";

export interface UtmParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
}

/** Reads utm_* from the current URL and persists them for the session. Call once on first mount. */
export function captureUtm(search: string) {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(search);
  const utm: UtmParams = {};
  (["utm_source", "utm_medium", "utm_campaign", "utm_content"] as const).forEach(
    (key) => {
      const val = params.get(key);
      if (val) utm[key] = val;
    }
  );
  if (Object.keys(utm).length > 0) {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(utm));
  }
}

export function getStoredUtm(): UtmParams {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as UtmParams) : {};
  } catch {
    return {};
  }
}
