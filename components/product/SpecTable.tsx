import type { Product } from "@/lib/types";

interface SpecTableProps {
  product: Product;
}

export default function SpecTable({ product }: SpecTableProps) {
  const rows: { label: string; value: string }[] = [
    { label: "الحجم", value: `${product.volume_ml} ml` },
    { label: "الوزن", value: `${product.weight_g} g` },
    { label: "المادة", value: product.material },
    { label: "السدادة", value: product.cap_label_ar ?? product.cap_type },
    ...(product.neck_mm ? [{ label: "فوهة", value: `${product.neck_mm} mm` }] : []),
    ...(product.units_per_box
      ? [{ label: "الكرتون", value: `${product.units_per_box} وحدة` }]
      : []),
  ];

  return (
    <div className="mt-5">
      <div className="px-4 pb-2 text-[16px] font-bold text-text">📋 المواصفات الكاملة</div>
      <div className="mx-4 overflow-hidden rounded-xl border border-border">
        {rows.map((row, i) => (
          <div
            key={row.label}
            className={`flex justify-between bg-bg px-3.5 py-3 text-[15px] ${
              i < rows.length - 1 ? "border-b border-border" : ""
            }`}
          >
            <div className="text-muted">{row.label}</div>
            <div dir="ltr" className="font-bold text-text">
              {row.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
