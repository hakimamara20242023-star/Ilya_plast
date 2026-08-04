import Link from "next/link";
import { volumeLabel } from "@/lib/variants";
import type { Product } from "@/lib/types";

interface VolumeFamilyProps {
  product: Product;
  family: Product[];
}

/** "Do you have other sizes?" — same card treatment as WeightVariants for
 * visual consistency between the two sections. */
export default function VolumeFamily({ product, family }: VolumeFamilyProps) {
  if (family.length < 2) return null;

  return (
    <div className="mt-5 px-4">
      <div className="mb-2.5 text-[16px] font-bold text-text">📏 نفس الشكل · أحجام أخرى</div>
      <div className="flex gap-2.5 overflow-x-auto">
        {family.map((v) => {
          const isCurrent = v.volume_ml === product.volume_ml;
          const card = (
            <div
              className={`min-w-[84px] flex-none rounded-xl p-3.5 text-center ${
                isCurrent ? "border-2 border-brand bg-brand/10" : "border border-border bg-bg"
              }`}
            >
              <div
                dir="ltr"
                className={`text-[18px] font-bold ${isCurrent ? "text-brand" : "text-text"}`}
              >
                {volumeLabel(v.volume_ml)}
              </div>
              {isCurrent && <div className="mt-1 text-[12px] font-bold text-brand">▲ أنت هنا</div>}
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
