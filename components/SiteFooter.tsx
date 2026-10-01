import Link from "next/link";
import WhatsAppButton from "./WhatsAppButton";
import ContactPhoneLink from "./ContactPhoneLink";
import { company } from "@/lib/company";

export default function SiteFooter() {
  return (
    <footer className="bg-text text-white">
      <div className="mx-auto grid max-w-[1100px] gap-7 px-4 py-9 md:grid-cols-3">
        <div>
          <div className="text-[17px] font-extrabold">{company.name}</div>
          <p className="mt-2 max-w-[320px] text-[13px] leading-7 text-white/70">
            مصنع قوارير بلاستيكية PET و HDPE في {company.city}، موجّه لأصحاب المصانع
            والموزّعين.
          </p>
        </div>

        <div>
          <div className="text-[13px] font-extrabold text-white/90">تصفح</div>
          <div className="mt-2.5 flex flex-col gap-2">
            <Link href="/#categories" className="text-[13px] text-white/70 hover:text-white">
              المنتجات
            </Link>
            <Link href="/about" className="text-[13px] text-white/70 hover:text-white">
              من نحن
            </Link>
            <Link href="/contact" className="text-[13px] text-white/70 hover:text-white">
              اتصل بنا
            </Link>
          </div>
        </div>

        <div>
          <div className="text-[13px] font-extrabold text-white/90">تواصل</div>
          <div className="mt-2.5 flex flex-col items-start gap-2.5">
            <WhatsAppButton
              source="header"
              className="flex items-center gap-1.5 text-[14px] font-bold text-accent"
            >
              <span aria-hidden>💬</span> تواصل عبر واتساب
            </WhatsAppButton>
            <ContactPhoneLink phone={company.phoneTel} className="text-[13px] text-white/75">
              <span aria-hidden>📞</span>{" "}
              <span dir="ltr">{company.phoneDisplay}</span>
            </ContactPhoneLink>
            <a
              href={company.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[13px] text-white/75 hover:text-white"
            >
              <span aria-hidden>📍</span> {company.address}
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 px-4 py-4 text-center text-[11px] text-white/40">
        © {new Date().getFullYear()} {company.name} — تصنيع محلي في {company.city}
      </div>
    </footer>
  );
}
