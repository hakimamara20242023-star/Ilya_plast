import { getSupabaseServerClient } from "./supabase/server";
import type { Category, Product } from "./types";

export async function getCategories(): Promise<Category[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getCategory(id: string): Promise<Category | null> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getAllActiveProducts(): Promise<Product[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getProductsByCategory(
  categoryId: string
): Promise<Product[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .eq("category_id", categoryId)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getProductsByVariantGroup(variantGroup: string): Promise<Product[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .eq("variant_group", variantGroup);

  if (error) throw error;
  return data ?? [];
}

export async function getProductsByFamilyGroup(familyGroup: string): Promise<Product[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .eq("family_group", familyGroup);

  if (error) throw error;
  return data ?? [];
}

export async function getProductBySku(sku: string): Promise<Product | null> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .eq("sku", sku)
    .maybeSingle();

  if (error) throw error;
  return data;
}

/** Everything the homepage needs to describe the catalogue, in one query:
 * per-category counts plus the real model count and volume range. Selects two
 * columns rather than whole rows, and lets the page state facts that come from
 * the data instead of hardcoded marketing numbers. */
export async function getCatalogSummary(): Promise<{
  counts: Record<string, number>;
  total: number;
  minVolumeMl: number | null;
  maxVolumeMl: number | null;
}> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("products")
    .select("category_id, volume_ml")
    .eq("is_active", true);

  if (error) throw error;

  const counts: Record<string, number> = {};
  const volumes: number[] = [];
  for (const row of data ?? []) {
    if (row.category_id) counts[row.category_id] = (counts[row.category_id] ?? 0) + 1;
    if (typeof row.volume_ml === "number") volumes.push(row.volume_ml);
  }

  return {
    counts,
    total: data?.length ?? 0,
    minVolumeMl: volumes.length ? Math.min(...volumes) : null,
    maxVolumeMl: volumes.length ? Math.max(...volumes) : null,
  };
}

/** A small, category-diverse set for the homepage "produits phares" strip.
 * Round-robins across categories so the row never shows eight near-identical
 * vinegar bottles, and only returns products that actually have a photo. */
export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .not("images", "is", null)
    .order("sort_order", { ascending: true })
    .order("volume_ml", { ascending: false })
    .limit(60);

  if (error) throw error;

  const byCategory = new Map<string, Product[]>();
  for (const p of data ?? []) {
    if (!p.images?.length) continue;
    const list = byCategory.get(p.category_id) ?? [];
    list.push(p);
    byCategory.set(p.category_id, list);
  }

  const picked: Product[] = [];
  const queues = Array.from(byCategory.values());
  for (let round = 0; picked.length < limit; round++) {
    const before = picked.length;
    for (const queue of queues) {
      if (picked.length >= limit) break;
      if (queue[round]) picked.push(queue[round]);
    }
    if (picked.length === before) break; // every queue exhausted
  }
  return picked;
}
