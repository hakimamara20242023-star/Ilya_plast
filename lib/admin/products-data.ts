import { getSupabaseAuthedServerClient } from "@/lib/supabase/server-auth";
import type { Category, Product } from "@/lib/types";

/** Every product, including drafts/hidden — relies on the `authenticated
 * read all products` RLS policy from 0003_admin.sql. */
export async function getAllProductsAdmin(): Promise<Product[]> {
  const supabase = await getSupabaseAuthedServerClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getProductByIdAdmin(id: string): Promise<Product | null> {
  const supabase = await getSupabaseAuthedServerClient();
  const { data, error } = await supabase.from("products").select("*").eq("id", id).maybeSingle();

  if (error) throw error;
  return data;
}

export async function getCategoriesAdmin(): Promise<Category[]> {
  const supabase = await getSupabaseAuthedServerClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export interface CapOption {
  cap_type: string;
  cap_label_ar: string | null;
}

/** Cap types already used in the catalog, so the form can offer them as
 * quick picks instead of forcing free text every time. */
export async function getKnownCapTypesAdmin(): Promise<CapOption[]> {
  const supabase = await getSupabaseAuthedServerClient();
  const { data, error } = await supabase
    .from("products")
    .select("cap_type, cap_label_ar")
    .order("cap_type", { ascending: true });

  if (error) throw error;

  const seen = new Map<string, string | null>();
  for (const row of data ?? []) {
    if (!seen.has(row.cap_type)) seen.set(row.cap_type, row.cap_label_ar);
  }
  return Array.from(seen.entries()).map(([cap_type, cap_label_ar]) => ({ cap_type, cap_label_ar }));
}
