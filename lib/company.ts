// Single source of truth for company and contact details.
//
// The phone number lives in NEXT_PUBLIC_WHATSAPP_PHONE and nowhere else, so the
// number shown on the page and the number WhatsApp opens can never drift apart
// again — they previously did, hardcoded separately in SiteFooter and the
// contact page.
//
// Only facts that are actually verified belong here. No capacity, no years in
// business, no certifications, no customer counts.

const RAW_PHONE = process.env.NEXT_PUBLIC_WHATSAPP_PHONE ?? "";

/** Digits only, e.g. '2135XXXXXXXX' — the form wa.me expects. */
export const whatsappDigits = RAW_PHONE.replace(/\D/g, "");

/** Grouped for display as +213 XXX XX XX XX; falls back to plain +digits. */
export function formatPhone(digits: string = whatsappDigits): string {
  if (digits.length === 12 && digits.startsWith("213")) {
    return `+213 ${digits.slice(3, 6)} ${digits.slice(6, 8)} ${digits.slice(8, 10)} ${digits.slice(10, 12)}`;
  }
  return digits ? `+${digits}` : "";
}

export const company = {
  name: "ILYA PLAST",
  city: "سطيف",
  country: "الجزائر",
  /** Plus Code supplied by the owner — precise and verifiable, unlike the
   *  generic "industrial zone" line it replaces. */
  plusCode: "5CJF+PV9",
  postalCode: "19000",
  address: "5CJF+PV9، سطيف 19000، الجزائر",
  mapUrl: "https://www.google.com/maps/search/?api=1&query=5CJF%2BPV9%20S%C3%A9tif",
  phoneDisplay: formatPhone(),
  phoneTel: whatsappDigits ? `+${whatsappDigits}` : "",
  /** Confirmed by the owner: samples really are sent before an order. */
  offersFreeSample: true,
  /** Confirmed by the owner: orders start around 300 units. Per-product
   *  min_order_qty in the database is the authority for a specific bottle. */
  minOrderQty: 300,
  materials: ["PET", "HDPE"],
} as const;
