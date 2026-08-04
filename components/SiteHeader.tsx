import Link from "next/link";
import WhatsAppButton from "./WhatsAppButton";

export default function SiteHeader() {
  return (
    <div className="flex items-center justify-between border-b border-border px-4 py-3.5">
      <Link href="/" className="text-[18px] font-extrabold tracking-wide text-brand">
        ILYA PLAST
      </Link>
      <WhatsAppButton
        source="header"
        ariaLabel="تواصل عبر واتساب"
        className="flex h-[38px] w-[38px] items-center justify-center rounded-full bg-accent text-[17px]"
      >
        💬
      </WhatsAppButton>
    </div>
  );
}
