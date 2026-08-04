import type { Metadata } from "next";
import AdminProductsTable from "@/components/admin/AdminProductsTable";
import { getAllProductsAdmin, getCategoriesAdmin } from "@/lib/admin/products-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "المنتجات — لوحة التحكم",
};

interface ProductsPageProps {
  searchParams: Promise<{ missing?: string }>;
}

export default async function AdminProductsPage({ searchParams }: ProductsPageProps) {
  const { missing } = await searchParams;
  const [products, categories] = await Promise.all([getAllProductsAdmin(), getCategoriesAdmin()]);

  const initialMissing =
    missing === "images" || missing === "units_per_box" || missing === "variant_group"
      ? missing
      : undefined;

  return (
    <div>
      <h1 className="mb-4 text-[18px] font-extrabold text-text">المنتجات</h1>
      <AdminProductsTable products={products} categories={categories} initialMissing={initialMissing} />
    </div>
  );
}
