import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import WhatsAppButton from "@/components/WhatsAppButton";
import ContactPhoneLink from "@/components/ContactPhoneLink";

export const metadata: Metadata = {
  title: "اتصل بنا — ILYA PLAST",
};

const PHONE_DISPLAY = "+213 555 01 02 03";
const PHONE_TEL = "+213555010203";

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-[640px] md:max-w-[1100px]">
      <SiteHeader />

      <div className="px-4 py-6">
        <h1 className="text-[20px] font-extrabold text-text">تواصل معنا</h1>
        <p className="mt-3 text-[15px] leading-8 text-muted">
          كل الاستفسارات والطلبات تتم عبر واتساب مباشرة. اضغط على الزر أدناه
          وسنرد عليك في أقرب وقت.
        </p>

        <WhatsAppButton
          source="header"
          className="mt-5 flex min-h-12 items-center justify-center gap-2 rounded-[10px] bg-accent px-4 py-4 text-[17px] font-extrabold text-white shadow-[0_4px_14px_rgba(37,211,102,0.35)]"
        >
          💬 تواصل عبر واتساب
        </WhatsAppButton>

        <div className="mt-6 flex flex-col gap-3 rounded-xl border border-border bg-surface p-4">
          <ContactPhoneLink phone={PHONE_TEL} className="text-[15px] font-bold text-text">
            📞 {PHONE_DISPLAY}
          </ContactPhoneLink>
          <div className="text-[15px] text-muted">📍 المنطقة الصناعية، سطيف، الجزائر</div>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
