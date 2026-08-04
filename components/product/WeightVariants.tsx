"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { fbqTrackCustom, genEventId, sendCapiEvent } from "@/lib/pixel";
import { weightLabel } from "@/lib/variants";
import type { Product } from "@/lib/types";

interface WeightVariantsProps {
  product: Product;
  variants: Product[];
}

/**
 * The company's strongest selling argument ("can I pay less per unit?") —
 * give it visual weight. Lightest/heaviest are computed dynamically, never
 * hardcoded, since a new weight can be added at either end at any time.
 */
export default function WeightVariants({ product, variants }: WeightVariantsProps) {
  const ref = useRef<HTMLDivElement>(null);
  const fired = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (fired.current) return;
        if (entries.some((e) => e.isIntersecting)) {
          fired.current = true;
          const eventId = genEventId();
          fbqTrackCustom(
            "ViewVariants",
            { content_ids: [product.sku], variant_group: product.variant_group },
            eventId
          );
          sendCapiEvent({
            event_name: "ViewVariants",
            event_id: eventId,
            sku: product.sku,
            content_category: product.category_id,
          });
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [product.sku, product.variant_group, product.category_id]);

  if (variants.length < 2) return null;

  const lightestId = variants[0].id;
  const heaviestId = variants[variants.length - 1].id;

  return (
    <div ref={ref} className="mx-4 rounded-xl border border-brand/20 bg-brand/5 p-3.5">
      <div className="mb-2.5 text-[16px] font-bold text-text">⚖️ نفس القارورة · أوزان مختلفة</div>
      <div className="flex gap-2.5">
        {variants.map((v) => {
          const isCurrent = v.id === product.id;
          const isLightest = v.id === lightestId;
          const isHeaviest = v.id === heaviestId;

          const card = (
            <div
              className={`min-w-0 flex-1 rounded-xl p-3.5 text-center ${
                isCurrent ? "border-2 border-brand bg-brand/10" : "border border-border bg-bg"
              }`}
            >
              <div dir="ltr" className="text-[18px] font-bold text-text">
                {weightLabel(v.weight_g)}
              </div>
              <div className="mt-1 min-h-[14px] text-[12px] font-bold text-muted">
                {isCurrent ? "▲ أنت هنا" : isLightest ? "أخف" : isHeaviest ? "أمتن" : ""}
              </div>
              <div className="min-h-[14px] text-[12px] text-muted">
                {!isCurrent && isLightest ? "أرخص" : !isCurrent && isHeaviest ? "أقوى" : ""}
              </div>
            </div>
          );

          return isCurrent ? (
            <div key={v.id}>{card}</div>
          ) : (
            <Link key={v.id} href={`/p/${v.sku}`}>
              {card}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
