import { notFound } from "next/navigation";
import BackHeader from "@/components/BackHeader";
import CategoryFilters from "@/components/CategoryFilters";
import { getCategories, getCategory, getProductsByCategory } from "@/lib/products";

export const revalidate = 3600;

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((c) => ({ category: c.id }));
}

interface CategoryPageProps {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ material?: string }>;
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { category: categoryId } = await params;
  const { material } = await searchParams;
  const category = await getCategory(categoryId);
  if (!category) notFound();

  const products = await getProductsByCategory(categoryId);
  const initialMaterial = material === "HDPE" || material === "PET" ? material : undefined;

  return (
    <div className="mx-auto max-w-[640px] md:max-w-[1100px]">
      <BackHeader
        href="/"
        title={`${category.icon ?? ""} ${category.name_ar} — ${products.length} موديل`}
      />
      <CategoryFilters category={category} products={products} initialMaterial={initialMaterial} />
    </div>
  );
}
