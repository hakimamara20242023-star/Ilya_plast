"use server";

import { revalidateProduct } from "@/lib/revalidate";

/**
 * Call after writing a product row (e.g. from Supabase Studio + a script,
 * or a future internal tool) so the live site picks it up in ~2 seconds
 * instead of waiting for the hourly ISR revalidation.
 */
export async function saveProduct(product: { sku: string; category_id: string }) {
  revalidateProduct(product);
}
