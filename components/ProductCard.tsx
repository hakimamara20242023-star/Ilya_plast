import Link from "next/link";
import ProductImage from "./ProductImage";
import { volumeLabel, weightLabel } from "@/lib/variants";
import type { Product } from "@/lib/types";

interface ProductCardProps {
  product: Product;
  hasWeightVariants: boolean;
}

export default function ProductCard({ product, hasWeightVariants }: ProductCardProps) {
  const href = `/p/${product.sku}`;

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-bg">
      <Link
        href={href}
        className="relative flex aspect-square items-center justify-center border-b border-border bg-bg"
      >
        {hasWeightVariants && (
          <span className="absolute right-2 top-2 rounded-md bg-brand/10 px-[7px] py-[3px] text-[10px] font-bold text-brand">
            أوزان متعددة
          </span>
        )}
        <ProductImage
          product={product}
          sizes="(min-width: 900px) 200px, 45vw"
          placeholderClassName="h-[110px] w-[80px]"
        />
      </Link>
      <Link href={href} className="px-3 pb-0.5 pt-2.5">
        <div className="text-[20px] font-extrabold text-text">
          {volumeLabel(product.volume_ml)}
        </div>
        <div className="mt-[3px] text-[13px] text-muted">
          {weightLabel(product.weight_g)} · {product.cap_label_ar ?? product.cap_type}
        </div>
      </Link>
      <div className="px-3 pb-3 pt-2">
        <Link
          href={href}
          className="flex min-h-[44px] items-center justify-center gap-1.5 rounded-[10px] border border-brand px-2 py-[9px] text-[13px] font-bold text-brand"
        >
          استكشف
        </Link>
      </div>
    </div>
  );
}
