import { notFound } from "next/navigation";
import type { Metadata } from "next";
import BackHeader from "@/components/BackHeader";
import ProductGallery from "@/components/product/ProductGallery";
import ProductHeader from "@/components/product/ProductHeader";
import QuickSpecs from "@/components/product/QuickSpecs";
import UsesSection from "@/components/product/UsesSection";
import WeightVariants from "@/components/product/WeightVariants";
import VolumeFamily from "@/components/product/VolumeFamily";
import SpecTable from "@/components/product/SpecTable";
import OfferBox from "@/components/product/OfferBox";
import FactoryStrip from "@/components/product/FactoryStrip";
import StickyWhatsApp from "@/components/product/StickyWhatsApp";
import {
  getAllActiveProducts,
  getCategory,
  getProductBySku,
  getProductsByFamilyGroup,
  getProductsByVariantGroup,
} from "@/lib/products";
import { getVolumeFamily, getWeightVariants } from "@/lib/variants";
import { imageUrl } from "@/lib/storage";

export const revalidate = 3600;

export async function generateStaticParams() {
  const products = await getAllActiveProducts();
  return products.map((p) => ({ sku: p.sku }));
}

interface ProductPageProps {
  params: Promise<{ sku: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { sku } = await params;
  const product = await getProductBySku(sku);
  if (!product) return {};

  const uses = product.uses ?? [];
  const description = [uses.slice(0, 2).join("، "), `${product.volume_ml}ml`, product.material]
    .filter(Boolean)
    .join(" · ");

  const firstImage = product.images?.[0];

  return {
    title: `${product.name_ar} — ${product.sku} | ILYA PLAST`,
    description,
    openGraph: firstImage
      ? { images: [{ url: imageUrl(firstImage) }] }
      : undefined,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { sku } = await params;
  const product = await getProductBySku(sku);
  if (!product) notFound();

  const [category, variantSiblings, familySiblings] = await Promise.all([
    getCategory(product.category_id),
    product.variant_group ? getProductsByVariantGroup(product.variant_group) : Promise.resolve([]),
    product.family_group ? getProductsByFamilyGroup(product.family_group) : Promise.resolve([]),
  ]);

  const weightVariants = getWeightVariants(variantSiblings);
  const volumeFamily = getVolumeFamily(familySiblings, product);

  const firstImage = product.images?.[0];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name_ar,
    sku: product.sku,
    material: product.material,
    ...(firstImage ? { image: imageUrl(firstImage) } : {}),
    additionalProperty: [
      { "@type": "PropertyValue", name: "الحجم", value: `${product.volume_ml}ml` },
      { "@type": "PropertyValue", name: "الوزن", value: `${product.weight_g}g` },
    ],
  };

  return (
    <div className="mx-auto max-w-[640px] pb-28 lg:max-w-[1100px] lg:pb-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <BackHeader href={`/c/${product.category_id}`} title={category?.name_ar ?? ""} small />

      <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:px-4 lg:pt-6">
        <div className="lg:sticky lg:top-6 lg:self-start">
          <div className="pt-4 lg:pt-0">
            <ProductGallery product={product} />
          </div>
        </div>

        <div>
          <StickyWhatsApp product={product} />
          <ProductHeader product={product} />
          <QuickSpecs product={product} />
          <div className="mt-5">
            <UsesSection
              uses={product.uses ?? []}
              notSuitable={product.not_suitable ?? []}
              useNote={product.use_note}
              categoryId={product.category_id}
            />
          </div>
          <div className="mt-5">
            <WeightVariants product={product} variants={weightVariants} />
          </div>
          <VolumeFamily product={product} family={volumeFamily} />
          <SpecTable product={product} />
          <OfferBox product={product} />
          <FactoryStrip />
        </div>
      </div>
    </div>
  );
}
