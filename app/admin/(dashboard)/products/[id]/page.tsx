import { notFound } from "next/navigation";
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
  title: "تعديل منتج — لوحة التحكم",
};

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;

  const [product, categories, knownCapTypes, allProducts] = await Promise.all([
    getProductByIdAdmin(id),
    getCategoriesAdmin(),
    getKnownCapTypesAdmin(),
    getAllProductsAdmin(),
  ]);

  if (!product) notFound();

  return (
    <div>
      <h1 className="mb-4 text-[18px] font-extrabold text-text">تعديل منتج</h1>
      <ProductForm
        mode="edit"
        product={product}
        categories={categories}
        knownCapTypes={knownCapTypes}
        allProducts={allProducts}
      />
    </div>
  );
}
