import Link from "next/link";
import type { Category } from "@/lib/types";

interface CategoryCardProps {
  category: Category;
  count: number;
}

export default function CategoryCard({ category, count }: CategoryCardProps) {
  return (
    <Link
      href={`/c/${category.id}`}
      className="flex flex-col items-center gap-3 rounded-xl border border-border bg-surface px-3 py-[22px] text-center"
    >
      <div className="flex h-[38px] items-center justify-center text-[34px] leading-none">
        {category.icon}
      </div>
      <div className="text-[15px] font-extrabold text-text">{category.name_ar}</div>
      <div className="text-[12px] text-muted">{count} موديل</div>
    </Link>
  );
}
