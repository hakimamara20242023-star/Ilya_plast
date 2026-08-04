import type { Product } from "@/lib/types";

interface OfferBoxProps {
  product: Product;
}

export default function OfferBox({ product }: OfferBoxProps) {
  return (
    <div className="mx-4 mt-4 flex flex-col gap-2 rounded-xl border border-border bg-surface p-4">
      <div className="text-[14px] font-bold text-text">🎁 عيّنة مجانية قبل الطلب</div>
      <div className="text-[14px] font-bold text-text">
        📦 الطلبية من {product.min_order_qty.toLocaleString("en-US")} وحدة
      </div>
    </div>
  );
}
