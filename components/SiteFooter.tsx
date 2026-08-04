import WhatsAppButton from "./WhatsAppButton";
import ContactPhoneLink from "./ContactPhoneLink";

const PHONE_DISPLAY = "+213 555 01 02 03";
const PHONE_TEL = "+213555010203";

export default function SiteFooter() {
  return (
    <div className="flex flex-col gap-3.5 bg-text px-4 py-7 text-white">
      <div className="text-[16px] font-extrabold">ILYA PLAST</div>
      <WhatsAppButton
        source="header"
        className="flex items-center gap-1.5 text-[14px] font-bold text-accent"
      >
        💬 تواصل عبر واتساب
      </WhatsAppButton>
      <ContactPhoneLink phone={PHONE_TEL} className="text-[13px] text-white/75">
        📞 {PHONE_DISPLAY}
      </ContactPhoneLink>
      <div className="text-[13px] text-white/75">📍 المنطقة الصناعية، سطيف، الجزائر</div>
      <div className="mt-2 text-[11px] text-white/40">© ILYA PLAST — تصنيع محلي</div>
    </div>
  );
}
