import type { Product } from "@/lib/types";
import { volumeLabel, weightLabel } from "@/lib/variants";

interface QuickSpecsProps {
  product: Product;
}

export default function QuickSpecs({ product }: QuickSpecsProps) {
  const specs = [
    { value: volumeLabel(product.volume_ml), label: "الحجم" },
    { value: weightLabel(product.weight_g), label: "الوزن" },
    { value: product.material, label: "المادة" },
  ];

  return (
    <div className="mx-4 mt-4 flex rounded-xl border border-border py-3.5">
      {specs.map((spec, i) => (
        <div
          key={spec.label}
          className={`flex-1 text-center ${i < specs.length - 1 ? "border-e border-border" : ""}`}
        >
          <div dir="ltr" className="text-[20px] font-bold text-text">
            {spec.value}
          </div>
          <div className="mt-0.5 text-[12px] text-muted">{spec.label}</div>
        </div>
      ))}
    </div>
  );
}
