"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import ImageUploader from "./ImageUploader";
import TagInput from "./TagInput";
import Toast from "./Toast";
import { computeSku, computeVariantGroup, computeFamilyGroup } from "@/lib/admin/sku";
import { productFormSchema, zodErrorsToArabicMap } from "@/lib/admin/product-schema";
import { volumeLabel } from "@/lib/variants";
import { saveProduct } from "@/app/admin/(dashboard)/products/actions";
import type { Category, Product } from "@/lib/types";
import type { CapOption } from "@/lib/admin/products-data";

const CAP_LABEL_GUESSES: Record<string, string> = {
  F: "سدادة فليب",
  P: "بومبة/بيستوليه",
};

const ADVANCED_FIELD_KEYS = new Set(["sku", "name_ar", "neck_mm", "material", "variant_group", "family_group", "model_no", "sort_order"]);
const OTHER_CAP = "__other__";

const USE_SUGGESTIONS: Record<string, string[]> = {
  DT: [
    "🧴 سائل أطباق",
    "🧹 منظف أرضيات",
    "🪟 منظف زجاج",
    "💧 جافيل مخفف",
    "🧽 منظف عام",
    "🏭 استعمال مهني",
    "🏨 فنادق ومطاعم",
  ],
  MED: ["💊 دواء سائل", "🧴 كحول طبي", "🩹 مطهر"],
  ALI: ["🫒 زيت طعام", "🍯 عسل", "🥤 عصير"],
  COS: ["🧴 شامبو", "🧴 كريم", "💄 مستحضر تجميل"],
  VEN: ["🍾 خل تفاح", "🍾 خل أبيض"],
};

const NOT_SUITABLE_SUGGESTIONS = [
  "المذيبات القوية",
  "الأحماض المركزة",
  "الزيوت الساخنة",
  "المواد الكاشطة",
];

interface ProductFormProps {
  mode: "create" | "edit";
  categories: Category[];
  knownCapTypes: CapOption[];
  allProducts: Product[];
  product?: Product;
  duplicateSeed?: Product;
}

/** A field that's auto-derived from other inputs until the user edits it
 * directly — then it "unlocks" and stops following. For an existing record,
 * it starts unlocked only if the stored value doesn't match what auto-gen
 * would currently produce (so simply opening/resaving a product never
 * silently changes it). */
function useAutoField(auto: string, storedInitial: string | undefined) {
  const [touched, setTouched] = useState(
    () => storedInitial !== undefined && storedInitial !== auto
  );
  const [manualValue, setManualValue] = useState(storedInitial ?? auto);
  const value = touched ? manualValue : auto;

  return {
    value,
    onManualChange(v: string) {
      setTouched(true);
      setManualValue(v);
    },
  };
}

export default function ProductForm({
  mode,
  categories,
  knownCapTypes,
  allProducts,
  product,
  duplicateSeed,
}: ProductFormProps) {
  const router = useRouter();
  const seed = product ?? duplicateSeed;

  const [categoryId, setCategoryId] = useState(seed?.category_id ?? categories[0]?.id ?? "");
  const [volumeMl, setVolumeMl] = useState(seed?.volume_ml ? String(seed.volume_ml) : "");
  const [weightG, setWeightG] = useState(
    duplicateSeed ? "" : seed?.weight_g ? String(seed.weight_g) : ""
  );
  const [capType, setCapType] = useState(seed?.cap_type ?? "");
  const [capOther, setCapOther] = useState("");
  const [capLabelAr, setCapLabelAr] = useState(seed?.cap_label_ar ?? "");
  const [unitsPerBox, setUnitsPerBox] = useState(seed?.units_per_box ? String(seed.units_per_box) : "");
  const [minOrderQty, setMinOrderQty] = useState(String(seed?.min_order_qty ?? 5000));
  const [images, setImages] = useState<string[]>(seed?.images ?? []);
  const [neckMm, setNeckMm] = useState(seed?.neck_mm ? String(seed.neck_mm) : "");
  const [material, setMaterial] = useState(seed?.material ?? "PET");
  const [sortOrder, setSortOrder] = useState(String(seed?.sort_order ?? 0));
  const [modelNo, setModelNo] = useState(String(seed?.model_no ?? 1));
  const [uses, setUses] = useState<string[]>(seed?.uses ?? []);
  const [notSuitable, setNotSuitable] = useState<string[]>(seed?.not_suitable ?? []);
  const [useNote, setUseNote] = useState(seed?.use_note ?? "");

  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<"draft" | "publish" | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const weightInputRef = useRef<HTMLInputElement>(null);
  const isOtherCap = capType !== "" && !knownCapTypes.some((c) => c.cap_type === capType);
  const effectiveCapType = isOtherCap ? capOther : capType;

  const modelNoNumber = Number(modelNo) || 1;

  const autoSku = useMemo(
    () => computeSku(categoryId, effectiveCapType, volumeMl, weightG, modelNoNumber),
    [categoryId, effectiveCapType, volumeMl, weightG, modelNoNumber]
  );
  const autoVariantGroup = useMemo(
    () => computeVariantGroup(categoryId, effectiveCapType, volumeMl, modelNoNumber),
    [categoryId, effectiveCapType, volumeMl, modelNoNumber]
  );
  const autoFamilyGroup = useMemo(
    () => computeFamilyGroup(categoryId, effectiveCapType, modelNoNumber),
    [categoryId, effectiveCapType, modelNoNumber]
  );
  const category = categories.find((c) => c.id === categoryId);
  const autoNameAr = useMemo(() => {
    if (!category || !volumeMl) return "";
    const label = capLabelAr || CAP_LABEL_GUESSES[effectiveCapType] || effectiveCapType;
    return `${category.name_ar} ${label} ${volumeLabel(Number(volumeMl))}`.trim();
  }, [category, capLabelAr, effectiveCapType, volumeMl]);

  // Never seed from duplicateSeed.sku — the whole point of duplicating is a
  // fresh SKU once the new weight is typed (id/sku/weight_g/created_at are
  // the fields the duplicate flow explicitly does NOT copy).
  const skuField = useAutoField(autoSku, product?.sku);
  const variantGroupField = useAutoField(autoVariantGroup, seed?.variant_group ?? undefined);
  const familyGroupField = useAutoField(autoFamilyGroup, seed?.family_group ?? undefined);
  const nameField = useAutoField(autoNameAr, seed?.name_ar);

  const fieldsReady = Boolean(categoryId && effectiveCapType && volumeMl && weightG);

  const variantSiblings = allProducts.filter(
    (p) => p.variant_group === variantGroupField.value && p.id !== product?.id
  );
  const familySiblings = useMemo(() => {
    const seen = new Map<number, Product>();
    allProducts
      .filter((p) => p.family_group === familyGroupField.value && p.id !== product?.id)
      .forEach((p) => {
        if (!seen.has(p.volume_ml)) seen.set(p.volume_ml, p);
      });
    return Array.from(seen.values());
  }, [allProducts, familyGroupField.value, product?.id]);

  const previewProduct: Product = {
    id: product?.id ?? "preview",
    sku: skuField.value || "—",
    category_id: categoryId,
    name_ar: nameField.value || "اسم المنتج",
    name_fr: null,
    volume_ml: Number(volumeMl) || 0,
    weight_g: Number(weightG) || 0,
    cap_type: effectiveCapType,
    cap_label_ar: capLabelAr || null,
    neck_mm: neckMm ? Number(neckMm) : null,
    material,
    units_per_box: unitsPerBox ? Number(unitsPerBox) : null,
    min_order_qty: Number(minOrderQty) || 5000,
    colors: null,
    images,
    variant_group: variantGroupField.value || null,
    family_group: familyGroupField.value || null,
    model_no: modelNoNumber,
    sort_order: Number(sortOrder) || 0,
    is_active: true,
    created_at: product?.created_at ?? new Date().toISOString(),
    uses,
    not_suitable: notSuitable,
    use_note: useNote || null,
  };

  async function handleSave(publish: boolean) {
    setSubmitting(publish ? "publish" : "draft");
    setErrors({});

    const parsed = productFormSchema.safeParse({
      category_id: categoryId,
      volume_ml: volumeMl,
      weight_g: weightG,
      cap_type: effectiveCapType,
      cap_label_ar: capLabelAr || null,
      units_per_box: unitsPerBox,
      min_order_qty: minOrderQty,
      images,
      sku: skuField.value,
      name_ar: nameField.value,
      neck_mm: neckMm || null,
      material,
      variant_group: variantGroupField.value || null,
      family_group: familyGroupField.value || null,
      model_no: modelNo,
      sort_order: sortOrder,
      is_active: publish,
      uses,
      not_suitable: notSuitable,
      use_note: useNote || null,
    });

    if (!parsed.success) {
      const fieldErrors = zodErrorsToArabicMap(parsed.error);
      setErrors(fieldErrors);
      if (Object.keys(fieldErrors).some((k) => ADVANCED_FIELD_KEYS.has(k))) setAdvancedOpen(true);
      setSubmitting(null);
      return;
    }

    const result = await saveProduct(parsed.data, mode, product?.id);
    setSubmitting(null);

    if (!result.success) {
      setErrors(result.errors);
      if (Object.keys(result.errors).some((k) => ADVANCED_FIELD_KEYS.has(k))) setAdvancedOpen(true);
      return;
    }

    const bumped = result.modelNo !== parsed.data.model_no;
    setToast(
      publish
        ? bumped
          ? `✅ تم الحفظ برقم تمييز ${result.modelNo} (كان هناك منتج بنفس المواصفات) — المنتج ظاهر الآن في الموقع`
          : "✅ تم الحفظ — المنتج ظاهر الآن في الموقع"
        : bumped
          ? `✅ تم حفظ المسودة برقم تمييز ${result.modelNo} — لن يظهر في الموقع حتى تنشره`
          : "✅ تم حفظ المسودة — لن يظهر في الموقع حتى تنشره"
    );
    setTimeout(() => router.push("/admin/products"), 1100);
  }

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_260px]">
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}

      <div className="order-2 flex flex-col gap-5 md:order-1">
        <Field label="الفئة" help="نوع المنتج">
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="min-h-12 w-full rounded-lg border border-border bg-surface px-3 text-[16px] text-text"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name_ar}
              </option>
            ))}
          </select>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="الحجم (ml)" help="مثال: 1000" error={errors.volume_ml}>
            <input
              type="number"
              inputMode="numeric"
              value={volumeMl}
              onChange={(e) => setVolumeMl(e.target.value)}
              className="min-h-12 w-full rounded-lg border border-border bg-surface px-3 text-[16px] text-text"
            />
          </Field>
          <Field label="الوزن (g)" help="وزن القارورة فارغة" error={errors.weight_g}>
            <input
              ref={weightInputRef}
              type="number"
              inputMode="decimal"
              autoFocus={Boolean(duplicateSeed)}
              value={weightG}
              onChange={(e) => setWeightG(e.target.value)}
              className="min-h-12 w-full rounded-lg border border-border bg-surface px-3 text-[16px] text-text"
            />
          </Field>
        </div>

        <Field label="السدادة" help="نوع الغطاء" error={errors.cap_type}>
          <select
            value={isOtherCap ? OTHER_CAP : capType}
            onChange={(e) => {
              const v = e.target.value;
              if (v === OTHER_CAP) {
                setCapType(OTHER_CAP);
                setCapLabelAr("");
              } else {
                setCapType(v);
                const known = knownCapTypes.find((c) => c.cap_type === v);
                setCapLabelAr(known?.cap_label_ar ?? CAP_LABEL_GUESSES[v] ?? "");
              }
            }}
            className="min-h-12 w-full rounded-lg border border-border bg-surface px-3 text-[16px] text-text"
          >
            <option value="">اختر...</option>
            {knownCapTypes.map((c) => (
              <option key={c.cap_type} value={c.cap_type}>
                {c.cap_type} — {c.cap_label_ar ?? "بدون تسمية"}
              </option>
            ))}
            <option value={OTHER_CAP}>سدادة جديدة...</option>
          </select>
        </Field>

        {isOtherCap && (
          <Field label="رمز السدادة الجديدة" help="مثال: S5">
            <input
              value={capOther}
              onChange={(e) => setCapOther(e.target.value.toUpperCase())}
              className="min-h-12 w-full rounded-lg border border-border bg-surface px-3 text-[16px] text-text"
              dir="ltr"
            />
          </Field>
        )}

        <Field label="تسمية السدادة" help="الاسم الذي يظهر للزبون">
          <input
            value={capLabelAr}
            onChange={(e) => setCapLabelAr(e.target.value)}
            className="min-h-12 w-full rounded-lg border border-border bg-surface px-3 text-[16px] text-text"
          />
        </Field>

        <Field label="الكرتون" help="عدد القوارير في الكرتون الواحد" error={errors.units_per_box}>
          <input
            type="number"
            inputMode="numeric"
            value={unitsPerBox}
            onChange={(e) => setUnitsPerBox(e.target.value)}
            className="min-h-12 w-full rounded-lg border border-border bg-surface px-3 text-[16px] text-text"
          />
        </Field>

        <Field label="أدنى طلب" help="أقل كمية يمكن للزبون طلبها">
          <input
            type="number"
            inputMode="numeric"
            value={minOrderQty}
            onChange={(e) => setMinOrderQty(e.target.value)}
            className="min-h-12 w-full rounded-lg border border-border bg-surface px-3 text-[16px] text-text"
          />
        </Field>

        <Field label="الصور" help="الصورة الأولى هي التي تظهر في القائمة" error={errors.images}>
          <ImageUploader sku={fieldsReady ? skuField.value : ""} images={images} onChange={setImages} />
        </Field>

        <Field label="الاستعمالات" help="شنو يقدر الزبون يعبّي في هاد القارورة؟">
          <TagInput
            values={uses}
            onChange={setUses}
            suggestions={USE_SUGGESTIONS[categoryId] ?? []}
            placeholder="مثال: 🧴 سائل أطباق"
          />
        </Field>

        <Field label="غير مناسبة لـ" help="واش ما يصلحش؟ هذا يزيد ثقة الزبون.">
          <TagInput
            values={notSuitable}
            onChange={setNotSuitable}
            suggestions={NOT_SUITABLE_SUGGESTIONS}
            placeholder="مثال: المذيبات القوية"
          />
        </Field>

        <Field label="ملاحظة تقنية" help="مثلا: للجافيل المركز ننصح بـ HDPE">
          <input
            value={useNote}
            onChange={(e) => setUseNote(e.target.value)}
            className="min-h-12 w-full rounded-lg border border-border bg-surface px-3 text-[16px] text-text"
          />
        </Field>

        <details
          open={advancedOpen}
          onToggle={(e) => setAdvancedOpen(e.currentTarget.open)}
          className="rounded-xl border border-border bg-surface"
        >
          <summary className="min-h-12 cursor-pointer list-none px-4 py-3 text-[14px] font-bold text-text">
            {advancedOpen ? "▾" : "▸"} إعدادات متقدمة
          </summary>
          <div className="flex flex-col gap-5 border-t border-border p-4">
            <Field label="المرجع (SKU)" help="يتولّد تلقائيًا، يمكنك تعديله" error={errors.sku}>
              <input
                value={skuField.value}
                onChange={(e) => skuField.onManualChange(e.target.value)}
                className="min-h-12 w-full rounded-lg border border-border bg-bg px-3 font-mono text-[14px] text-text"
                dir="ltr"
              />
            </Field>

            <Field label="اسم المنتج" help="يتولّد تلقائيًا من الفئة والسدادة والحجم" error={errors.name_ar}>
              <input
                value={nameField.value}
                onChange={(e) => nameField.onManualChange(e.target.value)}
                className="min-h-12 w-full rounded-lg border border-border bg-bg px-3 text-[16px] text-text"
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="فوهة (mm)" help="قطر فوهة القارورة">
                <input
                  type="number"
                  inputMode="numeric"
                  value={neckMm}
                  onChange={(e) => setNeckMm(e.target.value)}
                  className="min-h-12 w-full rounded-lg border border-border bg-bg px-3 text-[16px] text-text"
                />
              </Field>
              <Field label="المادة" help="PET أو HDPE">
                <select
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                  className="min-h-12 w-full rounded-lg border border-border bg-bg px-3 text-[16px] text-text"
                >
                  <option value="PET">PET</option>
                  <option value="HDPE">HDPE</option>
                </select>
              </Field>
            </div>

            <Field
              label="variant_group"
              help="يربط هذا المنتج بنفس القارورة بأوزان مختلفة"
              error={errors.variant_group}
            >
              <input
                value={variantGroupField.value}
                onChange={(e) => variantGroupField.onManualChange(e.target.value)}
                className="min-h-12 w-full rounded-lg border border-border bg-bg px-3 font-mono text-[13px] text-text"
                dir="ltr"
              />
              {variantSiblings.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {variantSiblings.map((p) => (
                    <Link
                      key={p.id}
                      href={`/admin/products/${p.id}`}
                      className="rounded-full border border-border bg-bg px-2 py-1 text-[11px] text-muted"
                    >
                      {p.weight_g}g
                    </Link>
                  ))}
                </div>
              )}
            </Field>

            <Field
              label="family_group"
              help="يربط هذا المنتج بنفس الشكل بأحجام مختلفة"
              error={errors.family_group}
            >
              <input
                value={familyGroupField.value}
                onChange={(e) => familyGroupField.onManualChange(e.target.value)}
                className="min-h-12 w-full rounded-lg border border-border bg-bg px-3 font-mono text-[13px] text-text"
                dir="ltr"
              />
              {familySiblings.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {familySiblings.map((p) => (
                    <Link
                      key={p.id}
                      href={`/admin/products/${p.id}`}
                      className="rounded-full border border-border bg-bg px-2 py-1 text-[11px] text-muted"
                    >
                      {volumeLabel(p.volume_ml)}
                    </Link>
                  ))}
                </div>
              )}
            </Field>

            <Field
              label="رقم المنتج"
              help="غيّره فقط إذا كان هذا منتجًا مختلفًا بنفس الحجم والوزن والسدادة (مثلاً خل تفاح مقابل خل أبيض)"
              error={errors.model_no}
            >
              <input
                type="number"
                inputMode="numeric"
                value={modelNo}
                onChange={(e) => setModelNo(e.target.value)}
                className="min-h-12 w-full rounded-lg border border-border bg-bg px-3 text-[16px] text-text"
                dir="ltr"
              />
            </Field>

            <Field label="الترتيب" help="رقم أصغر = يظهر أولًا في القائمة">
              <input
                type="number"
                inputMode="numeric"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="min-h-12 w-full rounded-lg border border-border bg-bg px-3 text-[16px] text-text"
              />
            </Field>
          </div>
        </details>

        <div className="flex gap-3 pb-4">
          <button
            type="button"
            disabled={submitting !== null}
            onClick={() => handleSave(false)}
            className="min-h-12 flex-1 rounded-lg border border-border bg-bg text-[15px] font-bold text-text disabled:opacity-60"
          >
            {submitting === "draft" ? "جارٍ الحفظ..." : "حفظ كمسودة"}
          </button>
          <button
            type="button"
            disabled={submitting !== null}
            onClick={() => handleSave(true)}
            className="min-h-12 flex-1 rounded-lg bg-brand text-[15px] font-extrabold text-white disabled:opacity-60"
          >
            {submitting === "publish" ? "جارٍ النشر..." : "حفظ ونشر"}
          </button>
        </div>
      </div>

      <div className="order-1 md:order-2">
        <div className="mb-2 text-[13px] font-bold text-muted">معاينة</div>
        <div className="md:sticky md:top-20">
          {fieldsReady ? (
            <div className="pointer-events-none max-w-[220px]">
              <ProductCard
                product={previewProduct}
                hasWeightVariants={variantSiblings.length > 0}
              />
            </div>
          ) : (
            <div className="flex aspect-[3/4] max-w-[220px] items-center justify-center rounded-xl border border-dashed border-border bg-surface p-4 text-center text-[12px] text-muted">
              املأ الفئة والسدادة والحجم والوزن لرؤية المعاينة
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  help,
  error,
  children,
}: {
  label: string;
  help?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[14px] font-bold text-text">{label}</label>
      {children}
      {error ? (
        <div className="mt-1 text-[12px] font-bold text-red-600">{error}</div>
      ) : help ? (
        <div className="mt-1 text-[12px] text-muted">{help}</div>
      ) : null}
    </div>
  );
}
