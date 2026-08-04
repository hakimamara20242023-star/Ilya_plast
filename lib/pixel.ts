"use client";

export function genEventId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `evt_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

/** Standard Meta Pixel event (PageView, ViewContent, Lead, Contact...). */
export function fbqTrack(
  event: string,
  params?: Record<string, unknown>,
  eventId?: string
) {
  if (typeof window === "undefined" || !window.fbq) return;
  if (eventId) {
    window.fbq("track", event, params ?? {}, { eventID: eventId });
  } else {
    window.fbq("track", event, params ?? {});
  }
}

/** Custom Meta Pixel event (ViewCategory, Search, ViewVariants...). */
export function fbqTrackCustom(
  event: string,
  params?: Record<string, unknown>,
  eventId?: string
) {
  if (typeof window === "undefined" || !window.fbq) return;
  if (eventId) {
    window.fbq("trackCustom", event, params ?? {}, { eventID: eventId });
  } else {
    window.fbq("trackCustom", event, params ?? {});
  }
}

export interface CapiPayload {
  event_name: string;
  event_id: string;
  sku?: string;
  content_category?: string;
  source?: string;
}

/**
 * Sends the same event to our Conversions API relay, using sendBeacon so the
 * request survives the browser navigating away to WhatsApp (falls back to a
 * keepalive fetch on browsers without sendBeacon).
 */
export function sendCapiEvent(payload: CapiPayload) {
  try {
    const body = JSON.stringify(payload);
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      const blob = new Blob([body], { type: "application/json" });
      const ok = navigator.sendBeacon("/api/meta-capi", blob);
      if (ok) return;
    }
    fetch("/api/meta-capi", {
      method: "POST",
      body,
      keepalive: true,
      headers: { "Content-Type": "application/json" },
    }).catch(() => {});
  } catch (err) {
    console.error("CAPI send failed", err);
  }
}
