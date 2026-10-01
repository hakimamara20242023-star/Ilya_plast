import type { MetadataRoute } from "next";
import { getAllActiveProducts, getCategories } from "@/lib/products";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://ilya-plast.vercel.app";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, products] = await Promise.all([getCategories(), getAllActiveProducts()]);

  return [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/contact`, changeFrequency: "monthly", priority: 0.5 },
    ...categories.map((c) => ({
      url: `${SITE_URL}/c/${c.id}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...products.map((p) => ({
      url: `${SITE_URL}/p/${encodeURIComponent(p.sku)}`,
      lastModified: p.created_at ? new Date(p.created_at) : undefined,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
