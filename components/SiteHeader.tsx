import Image from "next/image";
import Link from "next/link";
import WhatsAppButton from "./WhatsAppButton";

const NAV = [
  { href: "/", label: "الرئيسية" },
  { href: "/#categories", label: "المنتجات" },
  { href: "/about", label: "من نحن" },
  { href: "/contact", label: "اتصل بنا" },
];

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-bg/95 backdrop-blur supports-[backdrop-filter]:bg-bg/80">
      <div className="flex items-center justify-between gap-3 px-4 py-2.5">
        <Link href="/" aria-label="ILYA PLAST — الصفحة الرئيسية" className="flex-none">
          <Image
            src="/logo.webp"
            alt="ILYA PLAST"
            width={480}
            height={314}
            priority
            className="h-10 w-auto md:h-12"
          />
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[14px] font-bold text-muted transition-colors hover:text-brand"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <WhatsAppButton
          source="header"
          ariaLabel="تواصل عبر واتساب"
          className="flex min-h-10 flex-none items-center gap-1.5 rounded-[10px] bg-accent px-3 text-[14px] font-extrabold text-white md:px-4"
        >
          <span aria-hidden>💬</span>
          <span className="hidden sm:inline">واتساب</span>
        </WhatsAppButton>
      </div>
    </header>
  );
}
