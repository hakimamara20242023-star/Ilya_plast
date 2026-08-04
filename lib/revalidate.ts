import { revalidatePath } from "next/cache";

export function revalidateProduct(product: { sku: string; category_id: string }) {
  revalidatePath("/");
  revalidatePath(`/c/${product.category_id}`);
  revalidatePath(`/p/${product.sku}`);
}
