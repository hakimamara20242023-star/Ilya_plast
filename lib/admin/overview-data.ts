import { getSupabaseAuthedServerClient } from "@/lib/supabase/server-auth";

export interface WhatsappStats30d {
  total: number;
  topSkus: { sku: string; count: number }[];
}

export async function getWhatsappStats30d(): Promise<WhatsappStats30d> {
  const supabase = await getSupabaseAuthedServerClient();
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from("whatsapp_clicks")
    .select("sku")
    .gte("created_at", since);

  if (error) throw error;

  const rows = data ?? [];
  const counts = new Map<string, number>();
  for (const row of rows) {
    if (!row.sku) continue;
    counts.set(row.sku, (counts.get(row.sku) ?? 0) + 1);
  }

  const topSkus = Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([sku, count]) => ({ sku, count }));

  return { total: rows.length, topSkus };
}

export interface NeedsAttention {
  missingImages: number;
  missingUnitsPerBox: number;
  missingVariantGroup: number;
}

export async function getNeedsAttention(): Promise<NeedsAttention> {
  const supabase = await getSupabaseAuthedServerClient();
  const { data, error } = await supabase
    .from("products")
    .select("images, units_per_box, variant_group");

  if (error) throw error;
  const rows = data ?? [];

  return {
    missingImages: rows.filter((p) => !p.images || p.images.length === 0).length,
    missingUnitsPerBox: rows.filter((p) => !p.units_per_box).length,
    missingVariantGroup: rows.filter((p) => !p.variant_group).length,
  };
}
