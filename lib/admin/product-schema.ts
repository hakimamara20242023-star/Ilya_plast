import { z } from "zod";

export const productFormSchema = z.object({
  category_id: z.string().min(1, "اختر الفئة"),
  volume_ml: z.coerce
    .number({ error: "أدخل حجمًا صحيحًا" })
    .int()
    .positive("أدخل حجمًا صحيحًا"),
  weight_g: z.coerce
    .number({ error: "أدخل وزنًا صحيحًا" })
    .positive("أدخل وزنًا صحيحًا"),
  cap_type: z.string().min(1, "اختر نوع السدادة"),
  cap_label_ar: z.string().optional().nullable(),
  units_per_box: z.coerce
    .number({ error: "أدخل عدد الوحدات في الكرتون" })
    .int()
    .positive("عدد الوحدات في الكرتون مطلوب"),
  min_order_qty: z.coerce.number().int().positive("أدخل أدنى طلب صحيح").default(5000),
  images: z.array(z.string()).min(1, "أضف صورة واحدة على الأقل"),
  sku: z.string().min(1, "المرجع مطلوب"),
  name_ar: z.string().min(1, "اسم المنتج مطلوب"),
  neck_mm: z.coerce.number().int().positive().optional().nullable(),
  material: z.string().default("PET"),
  variant_group: z.string().optional().nullable(),
  family_group: z.string().optional().nullable(),
  model_no: z.coerce.number().int().positive("أدخل رقمًا صحيحًا").default(1),
  sort_order: z.coerce.number().int().default(0),
  is_active: z.boolean(),
  uses: z.array(z.string()).default([]),
  not_suitable: z.array(z.string()).default([]),
  use_note: z.string().optional().nullable(),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;

/** First error message per field, in Arabic — never surface raw Zod/Postgres text. */
export function zodErrorsToArabicMap(error: z.ZodError): Record<string, string> {
  const map: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0]?.toString() ?? "form";
    if (!map[key]) map[key] = issue.message;
  }
  return map;
}
