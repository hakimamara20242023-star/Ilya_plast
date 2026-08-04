import type { Product } from "@/lib/types";

interface ProductHeaderProps {
  product: Product;
}

export default function ProductHeader({ product }: ProductHeaderProps) {
  return (
    <div className="px-4">
      <div className="text-[18px] font-bold text-text">{product.name_ar}</div>
      <div className="mt-1 font-mono text-[13px] text-muted">{product.sku}</div>
    </div>
  );
}
