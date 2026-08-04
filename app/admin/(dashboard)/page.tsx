import Link from "next/link";
import type { Metadata } from "next";
import { getNeedsAttention, getWhatsappStats30d } from "@/lib/admin/overview-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "نظرة عامة — لوحة التحكم",
};

export default async function AdminOverviewPage() {
  const [stats, attention] = await Promise.all([getWhatsappStats30d(), getNeedsAttention()]);

  const attentionRows = [
    {
      key: "images",
      label: "منتجات بدون صور",
      count: attention.missingImages,
      href: "/admin/products?missing=images",
    },
    {
      key: "units_per_box",
      label: "منتجات بدون عدد الكرتون",
      count: attention.missingUnitsPerBox,
      href: "/admin/products?missing=units_per_box",
    },
    {
      key: "variant_group",
      label: "منتجات بدون ربط أوزان",
      count: attention.missingVariantGroup,
      href: "/admin/products?missing=variant_group",
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-[18px] font-extrabold text-text">نظرة عامة</h1>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-border bg-bg p-4">
          <div className="text-[26px] font-extrabold text-brand">{stats.total}</div>
          <div className="mt-1 text-[12px] text-muted">نقرات واتساب (آخر 30 يوم)</div>
        </div>
        <Link
          href="/admin/analytics"
          className="flex flex-col justify-center rounded-xl border border-border bg-bg p-4 text-[13px] font-bold text-brand"
        >
          عرض الإحصائيات التفصيلية ←
        </Link>
      </div>

      {stats.topSkus.length > 0 && (
        <div className="rounded-xl border border-border bg-bg p-4">
          <div className="mb-3 text-[14px] font-extrabold text-text">الأكثر طلبًا (30 يوم)</div>
          <div className="flex flex-col gap-2">
            {stats.topSkus.map((row) => (
              <div key={row.sku} className="flex items-center justify-between text-[13px]">
                <span className="font-mono text-text">{row.sku}</span>
                <span className="font-bold text-muted">{row.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-xl border border-border bg-bg p-4">
        <div className="mb-3 text-[14px] font-extrabold text-text">يحتاج انتباه</div>
        <div className="flex flex-col gap-1">
          {attentionRows.map((row) => (
            <Link
              key={row.key}
              href={row.href}
              className="flex min-h-12 items-center justify-between rounded-lg px-2 text-[14px]"
            >
              <span className={row.count > 0 ? "text-text" : "text-muted"}>{row.label}</span>
              <span
                className={`rounded-full px-2.5 py-1 text-[12px] font-bold ${
                  row.count > 0 ? "bg-red-50 text-red-700" : "bg-accent/15 text-accent"
                }`}
              >
                {row.count > 0 ? row.count : "✓"}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
