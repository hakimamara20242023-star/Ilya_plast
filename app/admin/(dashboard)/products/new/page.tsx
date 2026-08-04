import type { Metadata } from "next";
import ProductForm from "@/components/admin/ProductForm";
import {
  getAllProductsAdmin,
  getCategoriesAdmin,
  getKnownCapTypesAdmin,
  getProductByIdAdmin,
} from "@/lib/admin/products-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "إضافة منتج — لوحة التحكم",
};

interface NewProductPageProps {
  searchParams: Promise<{ duplicate?: string }>;
}

export default async function NewProductPage({ searchParams }: NewProductPageProps) {
  const { duplicate } = await searchParams;

  const [categories, knownCapTypes, allProducts, duplicateSeed] = await Promise.all([
    getCategoriesAdmin(),
    getKnownCapTypesAdmin(),
    getAllProductsAdmin(),
    duplicate ? getProductByIdAdmin(duplicate) : Promise.resolve(null),
  ]);

  return (
    <div>
      <h1 className="mb-4 text-[18px] font-extrabold text-text">
        {duplicateSeed ? "نسخ منتج" : "إضافة منتج"}
      </h1>
      <ProductForm
        mode="create"
        categories={categories}
        knownCapTypes={knownCapTypes}
        allProducts={allProducts}
        duplicateSeed={duplicateSeed ?? undefined}
      />
    </div>
  );
}
