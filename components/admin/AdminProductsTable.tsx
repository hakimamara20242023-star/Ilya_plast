"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { imageUrl, toThumbPath } from "@/lib/storage";
import { volumeLabel, weightLabel } from "@/lib/variants";
import { hideProduct, showProduct } from "@/app/admin/(dashboard)/products/actions";
import type { Category, Product } from "@/lib/types";

type MissingFilter = "images" | "units_per_box" | "variant_group" | undefined;

interface AdminProductsTableProps {
  products: Product[];
  categories: Category[];
  initialMissing?: MissingFilter;
}

const ALL = "all";

export default function AdminProductsTable({
  products,
  categories,
  initialMissing,
}: AdminProductsTableProps) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(ALL);
  const [statusFilter, setStatusFilter] = useState(ALL);
  const [missingFilter, setMissingFilter] = useState<MissingFilter>(initialMissing);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [items, setItems] = useState(products);

  const categoryById = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);

  const filtered = items.filter((p) => {
    if (search) {
      const q = search.trim().toLowerCase();
      if (!p.sku.toLowerCase().includes(q) && !p.name_ar.includes(search.trim())) return false;
    }
    if (categoryFilter !== ALL && p.category_id !== categoryFilter) return false;
    if (statusFilter === "active" && !p.is_active) return false;
    if (statusFilter === "draft" && p.is_active) return false;
    if (missingFilter === "images" && p.images && p.images.length > 0) return false;
    if (missingFilter === "units_per_box" && p.units_per_box) return false;
    if (missingFilter === "variant_group" && p.variant_group) return false;
    return true;
  });

  async function toggleVisibility(p: Product) {
    setOpenMenuId(null);
    setItems((prev) =>
      prev.map((x) => (x.id === p.id ? { ...x, is_active: !x.is_active } : x))
    );
    if (p.is_active) {
      await hideProduct(p.id, p.category_id, p.sku);
    } else {
      await showProduct(p.id, p.category_id, p.sku);
    }
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-1 flex-wrap gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث بالمرجع أو الاسم..."
            className="min-h-11 min-w-[160px] flex-1 rounded-lg border border-border bg-bg px-3 text-[14px] text-text"
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="min-h-11 rounded-lg border border-border bg-bg px-2 text-[13px] text-text"
          >
            <option value={ALL}>كل الفئات</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name_ar}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="min-h-11 rounded-lg border border-border bg-bg px-2 text-[13px] text-text"
          >
            <option value={ALL}>كل الحالات</option>
            <option value="active">نشط</option>
            <option value="draft">مسودة</option>
          </select>
        </div>
        <Link
          href="/admin/products/new"
          className="flex min-h-11 items-center justify-center rounded-lg bg-brand px-4 text-[14px] font-extrabold text-white"
        >
          + إضافة منتج
        </Link>
      </div>

      {missingFilter && (
        <button
          onClick={() => setMissingFilter(undefined)}
          className="mb-3 rounded-full bg-brand/10 px-3 py-1.5 text-[12px] font-bold text-brand"
        >
          فلتر: {MISSING_LABELS[missingFilter]} ✕
        </button>
      )}

      <div className="flex flex-col gap-2">
        {filtered.map((p) => (
          <div
            key={p.id}
            className="flex items-center gap-3 rounded-xl border border-border bg-bg p-2.5"
          >
            <div className="relative h-14 w-14 flex-none overflow-hidden rounded-lg border border-border bg-surface">
              {p.images?.[0] ? (
                <Image src={imageUrl(toThumbPath(p.images[0]))} alt="" fill sizes="56px" style={{ objectFit: "cover" }} />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[10px] text-muted">
                  لا صورة
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="truncate font-mono text-[12px] text-muted">{p.sku}</div>
              <div className="truncate text-[14px] font-bold text-text">
                {volumeLabel(p.volume_ml)} · {weightLabel(p.weight_g)}
              </div>
              <div className="text-[11px] text-muted">{categoryById.get(p.category_id)?.name_ar}</div>
            </div>

            <span
              className={`flex-none rounded-full px-2.5 py-1 text-[11px] font-bold ${
                p.is_active ? "bg-accent/15 text-accent" : "bg-surface text-muted"
              }`}
            >
              {p.is_active ? "نشط" : "مسودة"}
            </span>

            <div className="relative flex-none">
              <button
                type="button"
                onClick={() => setOpenMenuId(openMenuId === p.id ? null : p.id)}
                aria-label="خيارات"
                className="flex h-11 w-11 items-center justify-center rounded-lg text-[18px] text-muted"
              >
                ⋮
              </button>
              {openMenuId === p.id && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                  <div className="absolute left-0 top-12 z-20 w-40 overflow-hidden rounded-lg border border-border bg-bg shadow-lg">
                    <Link
                      href={`/admin/products/${p.id}`}
                      className="flex min-h-11 items-center px-4 text-[14px] text-text"
                    >
                      تعديل
                    </Link>
                    <Link
                      href={`/admin/products/new?duplicate=${p.id}`}
                      className="flex min-h-11 items-center px-4 text-[14px] text-text"
                    >
                      نسخ
                    </Link>
                    <button
                      type="button"
                      onClick={() => toggleVisibility(p)}
                      className="flex min-h-11 w-full items-center px-4 text-right text-[14px] text-text"
                    >
                      {p.is_active ? "إخفاء" : "إظهار"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="py-10 text-center text-[13px] text-muted">لا توجد منتجات مطابقة</div>
        )}
      </div>
    </div>
  );
}

const MISSING_LABELS: Record<NonNullable<MissingFilter>, string> = {
  images: "بدون صور",
  units_per_box: "بدون كرتون",
  variant_group: "بدون ربط أوزان",
};
