import Link from "next/link";

export default function FactoryStrip() {
  return (
    <Link
      href="/"
      className="mx-4 mt-4 flex items-center justify-between rounded-xl bg-surface px-4 py-3.5"
    >
      <span className="text-[14px] font-bold text-text">🏭 مصنع ILYA PLAST — سطيف</span>
      <span className="text-[13px] font-bold text-brand">شوف المصنع ▶</span>
    </Link>
  );
}
