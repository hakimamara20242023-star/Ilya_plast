"use server";

import { getSupabaseAuthedServerClient } from "@/lib/supabase/server-auth";
import { revalidateProduct } from "@/lib/revalidate";
import { productFormSchema, type ProductFormValues } from "@/lib/admin/product-schema";
import { computeFamilyGroup, computeSku, computeVariantGroup } from "@/lib/admin/sku";

export type SaveResult =
  | { success: true; sku: string; modelNo: number }
  | { success: false; errors: Record<string, string> };

const MAX_MODEL_NO_ATTEMPTS = 20;

export async function saveProduct(
  values: ProductFormValues,
  mode: "create" | "edit",
  productId?: string
): Promise<SaveResult> {
  const parsed = productFormSchema.safeParse(values);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]?.toString() ?? "form";
      if (!errors[key]) errors[key] = issue.message;
    }
    return { success: false, errors };
  }

  const supabase = await getSupabaseAuthedServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, errors: { form: "انتهت الجلسة، سجّل الدخول من جديد" } };
  }

  const row = parsed.data;

  // First attempt uses exactly what was submitted — respects a manually
  // typed sku/variant_group/family_group override. Only on a real
  // duplicate-sku collision do we fall back to the canonical formula with
  // an incremented model_no, so the owner never has to pick a
  // disambiguating number by hand (see supabase/migrations/0005_model_no.sql).
  let attemptRow = row;

  for (let attempt = 0; attempt <= MAX_MODEL_NO_ATTEMPTS; attempt++) {
    const { error } =
      mode === "create"
        ? await supabase.from("products").insert(attemptRow)
        : await supabase.from("products").update(attemptRow).eq("id", productId);

    if (!error) {
      revalidateProduct({ sku: attemptRow.sku, category_id: attemptRow.category_id });
      return { success: true, sku: attemptRow.sku, modelNo: attemptRow.model_no };
    }

    if (error.code !== "23505") {
      console.error("saveProduct: db error", error);
      return { success: false, errors: { form: "حدث خطأ أثناء الحفظ، حاول مرة أخرى" } };
    }

    if (attempt === MAX_MODEL_NO_ATTEMPTS) {
      return { success: false, errors: { sku: "هذا المنتج موجود من قبل" } };
    }

    const nextModelNo = attemptRow.model_no + 1;
    attemptRow = {
      ...row,
      model_no: nextModelNo,
      sku: computeSku(row.category_id, row.cap_type, row.volume_ml, row.weight_g, nextModelNo),
      variant_group: computeVariantGroup(row.category_id, row.cap_type, row.volume_ml, nextModelNo),
      family_group: computeFamilyGroup(row.category_id, row.cap_type, nextModelNo),
    };
  }

  return { success: false, errors: { sku: "هذا المنتج موجود من قبل" } };
}

export async function hideProduct(id: string, categoryId: string, sku: string) {
  const supabase = await getSupabaseAuthedServerClient();
  await supabase.from("products").update({ is_active: false }).eq("id", id);
  revalidateProduct({ sku, category_id: categoryId });
}

export async function showProduct(id: string, categoryId: string, sku: string) {
  const supabase = await getSupabaseAuthedServerClient();
  await supabase.from("products").update({ is_active: true }).eq("id", id);
  revalidateProduct({ sku, category_id: categoryId });
}
