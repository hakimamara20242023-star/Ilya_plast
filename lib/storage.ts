// Product photos live in the Supabase Storage 'products' bucket (public
// read, admin-only write — see supabase/migrations/0003_admin.sql), keyed
// by SKU: '<sku>/full.webp' + '<sku>/thumb.webp' for the first image,
// '<sku>/2-full.webp' + '<sku>/2-thumb.webp' for the second, etc.
// products.images stores the 'full' path of each — the provider can be
// swapped later by only touching this file.

const BUCKET = "products";

export function imageUrl(path: string): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL env var");
  }
  return `${supabaseUrl}/storage/v1/object/public/${BUCKET}/${path}`;
}

/** 'sku/full.webp' -> 'sku/thumb.webp', 'sku/2-full.webp' -> 'sku/2-thumb.webp'. */
export function toThumbPath(fullPath: string): string {
  return fullPath.replace("full.webp", "thumb.webp");
}
