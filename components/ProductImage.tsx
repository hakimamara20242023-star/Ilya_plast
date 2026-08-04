import Image from "next/image";
import { imageUrl } from "@/lib/storage";
import { toneForMaterial } from "@/lib/visual";
import BottlePlaceholder from "./BottlePlaceholder";
import type { Product } from "@/lib/types";

interface ProductImageProps {
  product: Pick<Product, "images" | "material" | "name_ar">;
  imageIndex?: number;
  sizes: string;
  className?: string;
  placeholderClassName?: string;
  priority?: boolean;
}

export default function ProductImage({
  product,
  imageIndex = 0,
  sizes,
  className,
  placeholderClassName,
  priority = false,
}: ProductImageProps) {
  const path = product.images?.[imageIndex];

  if (!path) {
    return (
      <BottlePlaceholder
        tone={toneForMaterial(product.material)}
        className={placeholderClassName ?? className}
      />
    );
  }

  return (
    <Image
      src={imageUrl(path)}
      alt={product.name_ar}
      fill
      sizes={sizes}
      className={className}
      style={{ objectFit: "contain" }}
      priority={priority}
    />
  );
}
