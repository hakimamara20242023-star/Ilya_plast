"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ProductCard from "./ProductCard";
import { fbqTrackCustom, genEventId, sendCapiEvent } from "@/lib/pixel";
import { volumeLabel, weightLabel } from "@/lib/variants";
import type { Category, Product } from "@/lib/types";

interface CategoryFiltersProps {
  category: Category;
  products: Product[];
  initialMaterial?: string;
}

const ALL = "all";

export default function CategoryFilters({
  category,
  products,
  initialMaterial,
}: CategoryFiltersProps) {
  const [filterVolume, setFilterVolume] = useState(ALL);
  const [filterCap, setFilterCap] = useState(ALL);
  const [filterWeight, setFilterWeight] = useState(ALL);
  const [filterMaterial, setFilterMaterial] = useState(initialMaterial);

  const viewCategoryFired = useRef(false);
  const isFirstFilterRender = useRef(true);

  useEffect(() => {
    if (viewCategoryFired.current) return;
    viewCategoryFired.current = true;
    const eventId = genEventId();
    fbqTrackCustom(
      "ViewCategory",
      { content_category: category.id, num_items: products.length },
      eventId
    );
    sendCapiEvent({
      event_name: "ViewCategory",
      event_id: eventId,
      content_category: category.id,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const volumeOptions = useMemo(
    () =>
      Array.from(new Map(products.map((p) => [volumeLabel(p.volume_ml), p.volume_ml])).entries())
        .sort((a, b) => a[1] - b[1])
        .map(([label]) => label),
    [products]
  );

  const capOptions = useMemo(
    () =>
      Array.from(new Map(products.map((p) => [p.cap_type, p.cap_label_ar ?? p.cap_type])).entries()),
    [products]
  );

  const weightOptions = useMemo(
    () =>
      Array.from(new Map(products.map((p) => [weightLabel(p.weight_g), p.weight_g])).entries())
        .sort((a, b) => a[1] - b[1])
        .map(([label]) => label),
    [products]
  );

  const variantGroupCounts = useMemo(() => {
    const counts = new Map<string, number>();
    products.forEach((p) => {
      if (!p.variant_group) return;
      counts.set(p.variant_group, (counts.get(p.variant_group) ?? 0) + 1);
    });
    return counts;
  }, [products]);

  const filteredProducts = useMemo(
    () =>
      products.filter(
        (p) =>
          (filterVolume === ALL || volumeLabel(p.volume_ml) === filterVolume) &&
          (filterCap === ALL || p.cap_type === filterCap) &&
          (filterWeight === ALL || weightLabel(p.weight_g) === filterWeight) &&
          (!filterMaterial || p.material === filterMaterial)
      ),
    [products, filterVolume, filterCap, filterWeight, filterMaterial]
  );

  // Debounced Search event — fires once per settled filter change, not per click.
  useEffect(() => {
    if (isFirstFilterRender.current) {
      isFirstFilterRender.current = false;
      return;
    }
    const timer = setTimeout(() => {
      const parts: string[] = [];
      if (filterVolume !== ALL) parts.push(`volume=${filterVolume}`);
      if (filterCap !== ALL) parts.push(`cap=${filterCap}`);
      if (filterWeight !== ALL) parts.push(`weight=${filterWeight}`);
      const eventId = genEventId();
      fbqTrackCustom(
        "Search",
        { search_string: parts.join("&"), content_category: category.id },
        eventId
      );
      sendCapiEvent({ event_name: "Search", event_id: eventId, content_category: category.id });
    }, 800);
    return () => clearTimeout(timer);
  }, [filterVolume, filterCap, filterWeight, category.id]);

  return (
    <div>
      {filterMaterial && (
        <button
          onClick={() => setFilterMaterial(undefined)}
          className="m-4 mb-0 rounded-full bg-brand/10 px-3 py-1.5 text-[12px] font-bold text-brand"
        >
          فلتر: {filterMaterial} ✕
        </button>
      )}
      <div className="sticky top-0 z-10 flex gap-2 border-b border-border bg-bg px-4 py-2.5">
        <select
          value={filterVolume}
          onChange={(e) => setFilterVolume(e.target.value)}
          className="min-h-11 flex-1 rounded-lg border border-border bg-surface px-2 text-[13px] text-text"
        >
          <option value={ALL}>الحجم: الكل</option>
          {volumeOptions.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
        <select
          value={filterCap}
          onChange={(e) => setFilterCap(e.target.value)}
          className="min-h-11 flex-1 rounded-lg border border-border bg-surface px-2 text-[13px] text-text"
        >
          <option value={ALL}>السدادة: الكل</option>
          {capOptions.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <select
          value={filterWeight}
          onChange={(e) => setFilterWeight(e.target.value)}
          className="min-h-11 flex-1 rounded-lg border border-border bg-surface px-2 text-[13px] text-text"
        >
          <option value={ALL}>الوزن: الكل</option>
          {weightOptions.map((w) => (
            <option key={w} value={w}>
              {w}
            </option>
          ))}
        </select>
      </div>

      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 p-4 md:grid-cols-4">
          {filteredProducts.map((p, index) => (
            <ProductCard
              key={p.id}
              product={p}
              hasWeightVariants={(variantGroupCounts.get(p.variant_group ?? "") ?? 0) > 1}
              priority={index < 4}
            />
          ))}
        </div>
      ) : (
        <div className="px-4 py-10 text-center text-[14px] text-muted">
          لا توجد نتائج مطابقة للفلاتر المحددة
        </div>
      )}
    </div>
  );
}
