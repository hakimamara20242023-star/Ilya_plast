import Link from "next/link";
import type { Metadata } from "next";
import { getWhatsappClicksGrouped, type GroupedCount } from "@/lib/admin/analytics-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "الإحصائيات — لوحة التحكم",
};

const RANGES = [7, 30, 90] as const;

interface AnalyticsPageProps {
  searchParams: Promise<{ days?: string }>;
}

export default async function AdminAnalyticsPage({ searchParams }: AnalyticsPageProps) {
  const { days: daysParam } = await searchParams;
  const days = RANGES.includes(Number(daysParam) as (typeof RANGES)[number])
    ? Number(daysParam)
    : 30;

  const stats = await getWhatsappClicksGrouped(days);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-[18px] font-extrabold text-text">الإحصائيات</h1>
        <div className="flex gap-1 rounded-lg border border-border bg-bg p-1">
          {RANGES.map((r) => (
            <Link
              key={r}
              href={`/admin/analytics?days=${r}`}
              className={`flex min-h-9 items-center rounded-md px-3 text-[13px] font-bold ${
                r === days ? "bg-brand text-white" : "text-muted"
              }`}
            >
              {r} يوم
            </Link>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-bg p-4">
        <div className="text-[26px] font-extrabold text-brand">{stats.total}</div>
        <div className="mt-1 text-[12px] text-muted">إجمالي نقرات واتساب</div>
      </div>

      <GroupedTable title="حسب المنتج (SKU)" rows={stats.bySku} mono />
      <GroupedTable title="حسب المصدر" rows={stats.bySource} />
      <GroupedTable title="حسب الحملة الإعلانية" rows={stats.byCampaign} />
    </div>
  );
}

function GroupedTable({
  title,
  rows,
  mono,
}: {
  title: string;
  rows: GroupedCount[];
  mono?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-bg p-4">
      <div className="mb-3 text-[14px] font-extrabold text-text">{title}</div>
      {rows.length === 0 ? (
        <div className="text-[13px] text-muted">لا توجد بيانات في هذه الفترة</div>
      ) : (
        <div className="flex flex-col gap-2">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center justify-between text-[13px]">
              <span className={mono ? "font-mono text-text" : "text-text"}>{row.label}</span>
              <span className="font-bold text-muted">{row.count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
