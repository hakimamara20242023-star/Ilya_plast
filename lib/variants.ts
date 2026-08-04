import type { Product } from "./types";

export function volumeLabel(ml: number): string {
  if (ml >= 1000) {
    const liters = ml / 1000;
    const rounded = Number.isInteger(liters)
      ? String(liters)
      : String(parseFloat(liters.toFixed(2)));
    return `${rounded}L`;
  }
  return `${ml}ml`;
}

export function weightLabel(g: number): string {
  const rounded = Number.isInteger(g) ? String(g) : String(parseFloat(g.toFixed(2)));
  return `${rounded}g`;
}

/**
 * Same volume, different WEIGHTS ("can I pay less per unit?").
 * `siblings` is expected to already be scoped to one variant_group
 * (e.g. via getProductsByVariantGroup) and include the current product.
 * Hidden when fewer than 2 members.
 */
export function getWeightVariants(siblings: Product[]): Product[] {
  if (siblings.length < 2) return [];
  return siblings.slice().sort((a, b) => a.weight_g - b.weight_g);
}

/**
 * Same shape (cap), different VOLUMES ("do you have other sizes?").
 * `siblings` is expected to already be scoped to one family_group (e.g. via
 * getProductsByFamilyGroup) and include the current product. Deduplicated by
 * volume_ml — a family with 3 weight variants at 1L must still show a
 * single 1L entry, linked to whichever of those 3 is closest in weight to
 * the current product (itself, for its own volume). Hidden when fewer than
 * 2 distinct volumes exist.
 */
export function getVolumeFamily(siblings: Product[], currentProduct: Product): Product[] {
  const byVolume = new Map<number, Product>();

  for (const p of siblings) {
    const existing = byVolume.get(p.volume_ml);
    if (
      !existing ||
      Math.abs(p.weight_g - currentProduct.weight_g) <
        Math.abs(existing.weight_g - currentProduct.weight_g)
    ) {
      byVolume.set(p.volume_ml, p);
    }
  }

  const distinct = Array.from(byVolume.values()).sort((a, b) => a.volume_ml - b.volume_ml);
  return distinct.length < 2 ? [] : distinct;
}
