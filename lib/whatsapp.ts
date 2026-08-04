import type { Product } from "./types";

const SITE_HOST = (process.env.NEXT_PUBLIC_SITE_URL || "https://ilyaplast.dz").replace(
  /^https?:\/\//,
  ""
);

function phone(): string {
  const p = process.env.NEXT_PUBLIC_WHATSAPP_PHONE;
  if (!p) throw new Error("Missing NEXT_PUBLIC_WHATSAPP_PHONE env var");
  return p;
}

function waUrl(text: string): string {
  return `https://wa.me/${phone()}?text=${encodeURIComponent(text)}`;
}

export function buildProductWhatsAppMessage(product: Product): string {
  const uses = product.uses ?? [];
  const usesLine = uses.length > 0 ? `\n✅ ${uses.slice(0, 2).join(" · ")}` : "";

  return `سلام، نحب نستفسر على هاد المنتج:

📦 ${product.name_ar}
🔖 المرجع: ${product.sku}
📏 ${product.volume_ml}ml · ⚖️ ${product.weight_g}g${usesLine}

نحب نعرف السعر والعيّنة المجانية.
🔗 ${SITE_HOST}/p/${product.sku}`;
}

export function buildProductWhatsAppUrl(product: Product): string {
  return waUrl(buildProductWhatsAppMessage(product));
}

export function buildGeneralWhatsAppUrl(): string {
  return waUrl("مرحباً ILYA PLAST 👋\nأرغب في طلب عيّنة مجانية من القوارير.");
}
