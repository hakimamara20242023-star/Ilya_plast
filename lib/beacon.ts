"use client";

/**
 * Best-effort POST that survives the page unloading (e.g. the browser
 * navigating away to WhatsApp) — uses sendBeacon, falling back to a
 * keepalive fetch. Never throws; logging failures must never break the UI.
 */
export function postBeacon(url: string, body: Record<string, unknown>) {
  try {
    const payload = JSON.stringify(body);
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      const ok = navigator.sendBeacon(url, new Blob([payload], { type: "application/json" }));
      if (ok) return;
    }
    fetch(url, {
      method: "POST",
      body: payload,
      keepalive: true,
      headers: { "Content-Type": "application/json" },
    }).catch(() => {});
  } catch (err) {
    console.error(`beacon send failed (${url})`, err);
  }
}
