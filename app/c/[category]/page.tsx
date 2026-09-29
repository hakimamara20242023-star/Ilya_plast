import { notFound } from "next/navigation";
import BackHeader from "@/components/BackHeader";
import CategoryFilters from "@/components/CategoryFilters";
import WhatsAppButton from "@/components/WhatsAppButton";
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
        title={
          products.length > 0
            ? `${category.icon ?? ""} ${category.name_ar} — ${products.length} موديل`
            : `${category.icon ?? ""} ${category.name_ar} — قريباً`
        }
      />
      {products.length > 0 ? (
        <CategoryFilters category={category} products={products} initialMaterial={initialMaterial} />
      ) : (
        <div className="flex flex-col items-center gap-3 px-4 py-16 text-center">
          <div className="text-[40px] leading-none">{category.icon}</div>
          <div className="text-[16px] font-extrabold text-text">قريباً</div>
          <p className="max-w-[300px] text-[14px] leading-7 text-muted">
            جاري تحضير موديلات {category.name_ar}. تواصل معنا عبر واتساب ونوجّهك للمتوفر حاليًا.
          </p>
          <WhatsAppButton
            source="header"
            categoryId={category.id}
            className="mt-2 flex min-h-12 items-center justify-center gap-2 rounded-[10px] bg-accent px-6 text-[16px] font-extrabold text-white"
          >
            💬 تواصل عبر واتساب
          </WhatsAppButton>
        </div>
      )}
    </div>
  );
}
