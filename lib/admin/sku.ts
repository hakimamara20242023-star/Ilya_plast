// Shared with components/admin/ProductForm.tsx for live generation as the
// user types, and with the save action's collision-retry logic — both
// must derive sku/variant_group/family_group exactly the same way the DB
// trigger (set_product_groups in supabase/migrations/0005_model_no.sql)
// does, so the client-side preview never drifts from what's actually saved.
//
// model_no disambiguates two otherwise-identical products (same category +
// cap + volume + weight) that are genuinely different (different recipe/
// content). model_no === 1 is the overwhelming common case and is omitted
// everywhere below, so existing SKUs/groups are unaffected.

function modelSuffix(modelNo: number): string {
  return modelNo === 1 ? "" : `-${modelNo}`;
}

export function computeSku(
  category: string,
  cap: string,
  volumeMl: string | number,
  weightG: string | number,
  modelNo: number = 1
): string {
  return `${category}-${cap}-${volumeMl}ml-${weightG}g${modelSuffix(modelNo)}`;
}

export function computeVariantGroup(
  category: string,
  cap: string,
  volumeMl: string | number,
  modelNo: number = 1
): string {
  return `${category}-${cap}-${volumeMl}ml${modelSuffix(modelNo)}`;
}

export function computeFamilyGroup(
  category: string,
  cap: string,
  modelNo: number = 1
): string {
  return `${category}-${cap}${modelSuffix(modelNo)}`;
}
