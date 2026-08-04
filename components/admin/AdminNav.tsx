"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/admin/login/actions";

const LINKS = [
  { href: "/admin", label: "نظرة عامة" },
  { href: "/admin/products", label: "المنتجات" },
  { href: "/admin/analytics", label: "الإحصائيات" },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <div className="sticky top-0 z-10 border-b border-border bg-bg">
      <div className="mx-auto flex max-w-[1100px] items-center justify-between px-4 py-3">
        <div className="text-[15px] font-extrabold text-brand">ILYA PLAST</div>
        <form action={signOut}>
          <button
            type="submit"
            className="flex min-h-11 items-center px-2 text-[13px] font-bold text-muted"
          >
            تسجيل الخروج
          </button>
        </form>
      </div>
      <nav className="mx-auto flex max-w-[1100px] gap-1 overflow-x-auto px-2 pb-1">
        {LINKS.map((link) => {
          const isActive =
            link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex min-h-11 flex-1 items-center justify-center whitespace-nowrap rounded-t-lg px-4 text-[14px] font-bold ${
                isActive
                  ? "border-b-2 border-brand text-brand"
                  : "border-b-2 border-transparent text-muted"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
