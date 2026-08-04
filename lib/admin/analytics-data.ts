import { getSupabaseAuthedServerClient } from "@/lib/supabase/server-auth";

export interface GroupedCount {
  label: string;
  count: number;
}

export interface WhatsappClicksGrouped {
  total: number;
  bySku: GroupedCount[];
  bySource: GroupedCount[];
  byCampaign: GroupedCount[];
}

const SOURCE_LABELS_AR: Record<string, string> = {
  card: "بطاقة المنتج",
  product_page: "صفحة المنتج",
  header: "الرأس",
  home_cta: "الصفحة الرئيسية",
};

export async function getWhatsappClicksGrouped(days: number): Promise<WhatsappClicksGrouped> {
  const supabase = await getSupabaseAuthedServerClient();
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from("whatsapp_clicks")
    .select("sku, source, utm_campaign")
    .gte("created_at", since);

  if (error) throw error;
  const rows = data ?? [];

  function groupBy(
    pick: (row: (typeof rows)[number]) => string | null,
    fallback: string,
    labelize?: (raw: string) => string
  ): GroupedCount[] {
    const counts = new Map<string, number>();
    for (const row of rows) {
      const raw = pick(row) ?? fallback;
      const label = raw === fallback ? fallback : (labelize?.(raw) ?? raw);
      counts.set(label, (counts.get(label) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([label, count]) => ({ label, count }));
  }

  return {
    total: rows.length,
    bySku: groupBy((r) => r.sku, "بدون مرجع"),
    bySource: groupBy((r) => r.source, "غير محدد", (raw) => SOURCE_LABELS_AR[raw] ?? raw),
    byCampaign: groupBy((r) => r.utm_campaign, "بدون حملة"),
  };
}
