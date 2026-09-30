"use client";

import { useEffect, useRef, useState } from "react";
import ProductImage from "@/components/ProductImage";
import { fbqTrack, genEventId, sendCapiEvent } from "@/lib/pixel";
import { postBeacon } from "@/lib/beacon";
import { getStoredUtm } from "@/lib/utm";
import type { Product } from "@/lib/types";

const THUMB_LABELS = ["أمامي", "جانبي", "الغطاء"];
const SWIPE_THRESHOLD = 40;

interface ProductGalleryProps {
  product: Product;
}

export default function ProductGallery({ product }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const slotCount = Math.min(product.images?.length ?? 0, THUMB_LABELS.length);
  const hasMultiple = slotCount > 1;

  useEffect(() => {
    const eventId = genEventId();
    fbqTrack(
      "ViewContent",
      {
        content_ids: [product.sku],
        content_type: "product",
        content_name: product.name_ar,
        content_category: product.category_id,
      },
      eventId
    );
    sendCapiEvent({
      event_name: "ViewContent",
      event_id: eventId,
      sku: product.sku,
      content_category: product.category_id,
    });

    postBeacon("/api/log-view", {
      product_id: product.id,
      sku: product.sku,
      category_id: product.category_id,
      ...getStoredUtm(),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.sku]);

  function goTo(index: number) {
    setActiveIndex(Math.max(0, Math.min(index, Math.max(slotCount - 1, 0))));
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(deltaX) < SWIPE_THRESHOLD) return;
    // RTL: a swipe to the right (positive deltaX) moves to the next item.
    if (deltaX > 0) goTo(activeIndex + 1);
    else goTo(activeIndex - 1);
  }

  return (
    <>
      <div
        onClick={() => setLightboxOpen(true)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative mx-4 flex aspect-[3/4] cursor-zoom-in items-center justify-center overflow-hidden rounded-xl border border-border bg-bg"
      >
        <ProductImage
          product={product}
          imageIndex={activeIndex}
          sizes="(min-width: 1024px) 500px, 90vw"
          placeholderClassName="h-[60%] w-[60%]"
          priority={activeIndex === 0}
        />
      </div>

      {hasMultiple && (
        <div className="mt-2 flex justify-center gap-1.5">
          {Array.from({ length: slotCount }).map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`صورة ${i + 1}`}
              onClick={() => goTo(i)}
              className={`h-1.5 w-1.5 rounded-full ${i === activeIndex ? "bg-brand" : "bg-border"}`}
            />
          ))}
        </div>
      )}

      {hasMultiple && (
        <div className="mt-2 flex gap-2.5 px-4 pb-5">
          {Array.from({ length: slotCount }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              className="flex flex-1 flex-col items-center gap-1"
            >
              <div
                className={`relative flex aspect-[3/4] w-full items-center justify-center rounded-lg border bg-bg ${
                  i === activeIndex ? "border-2 border-brand" : "border-border"
                }`}
              >
                <ProductImage
                  product={product}
                  imageIndex={i}
                  sizes="80px"
                  className="h-[70%] w-[60%]"
                  placeholderClassName="h-[70%] w-[60%]"
                />
              </div>
              <div className={`text-[11px] ${i === activeIndex ? "text-brand" : "text-muted"}`}>
                {THUMB_LABELS[i]}
              </div>
            </button>
          ))}
        </div>
      )}

      {lightboxOpen && (
        <div
          onClick={() => setLightboxOpen(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="fixed inset-0 z-50 flex cursor-zoom-out items-center justify-center bg-black/90 p-6"
        >
          <div className="relative h-full w-full max-w-[600px]">
            <ProductImage
              product={product}
              imageIndex={activeIndex}
              sizes="90vw"
              className="h-full w-full"
              placeholderClassName="h-full w-full"
            />
          </div>
          <div className="absolute top-4 end-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-[20px] text-white">
            ✕
          </div>
        </div>
      )}
    </>
  );
}
