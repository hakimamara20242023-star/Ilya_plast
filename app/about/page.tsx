import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "من نحن — ILYA PLAST",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-[640px] md:max-w-[1100px]">
      <SiteHeader />

      <div className="px-4 py-6">
        <h1 className="text-[20px] font-extrabold text-text">ILYA PLAST</h1>
        <p className="mt-3 text-[15px] leading-8 text-muted">
          ILYA PLAST مصنع متخصص في تصنيع قوارير بلاستيكية من نوع PET و HDPE، يقع في
          المنطقة الصناعية بولاية سطيف، الجزائر. نصنّع أكثر من 50 موديل بأحجام
          تتراوح من 60ml إلى 5L، موجّهة لأصحاب المصانع في قطاعات المنظفات، الأدوية
          والكحول الطبي، الزيوت الغذائية، ومستحضرات التجميل.
        </p>
        <p className="mt-4 text-[15px] leading-8 text-muted">
          نعمل بنظام البيع بالجملة فقط — الطلبية الدنيا 5,000 وحدة — مع إمكانية
          الحصول على عيّنة مجانية قبل تأكيد أي طلب.
        </p>

        <div className="mt-6 flex justify-around border-y border-border bg-surface px-4 py-[22px] text-center">
          <div>
            <div className="text-[22px] font-extrabold text-brand">+50</div>
            <div className="mt-0.5 text-[12px] text-muted">موديل</div>
          </div>
          <div>
            <div className="text-[22px] font-extrabold text-brand">60ml→5L</div>
            <div className="mt-0.5 text-[12px] text-muted">مدى الأحجام</div>
          </div>
          <div>
            <div className="text-[22px] font-extrabold text-brand">سطيف</div>
            <div className="mt-0.5 text-[12px] text-muted">موقع المصنع</div>
          </div>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
