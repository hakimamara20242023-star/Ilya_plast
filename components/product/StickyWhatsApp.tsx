import WhatsAppButton from "@/components/WhatsAppButton";
import type { Product } from "@/lib/types";

interface StickyWhatsAppProps {
  product: Product;
}

/** Fixed 56px bottom bar on mobile; becomes a normal button at the top of
 * the info column on desktop (>=1024px). */
export default function StickyWhatsApp({ product }: StickyWhatsAppProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-10 mx-auto max-w-[640px] border-t border-border bg-bg/95 px-4 py-3 backdrop-blur lg:static lg:z-auto lg:mx-0 lg:max-w-none lg:border-0 lg:bg-transparent lg:px-4 lg:pb-0 lg:pt-4">
      <WhatsAppButton
        product={product}
        source="product_page"
        className="flex min-h-[56px] items-center justify-center gap-2 rounded-[10px] bg-accent text-[16px] font-bold text-white"
      >
        اطلب هذا المنتج عبر واتساب
      </WhatsAppButton>
    </div>
  );
}
