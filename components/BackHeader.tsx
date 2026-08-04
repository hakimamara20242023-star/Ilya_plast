import Link from "next/link";

interface BackHeaderProps {
  href: string;
  title: string;
  small?: boolean;
}

export default function BackHeader({ href, title, small }: BackHeaderProps) {
  return (
    <div className="flex items-center gap-2.5 border-b border-border px-4 py-3.5">
      <Link
        href={href}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-bg text-[18px] text-brand"
        aria-label="رجوع"
      >
        →
      </Link>
      <div className={small ? "text-[14px] font-bold text-muted" : "text-[16px] font-extrabold text-text"}>
        {title}
      </div>
    </div>
  );
}
