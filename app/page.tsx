import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import CategoryCard from "@/components/CategoryCard";
import WhatsAppButton from "@/components/WhatsAppButton";
import { getAllActiveProducts, getCategories } from "@/lib/products";

export const revalidate = 3600;

const FACTORY_PHOTOS = [
  "خط الإنتاج",
  "مستودع المواد الأولية",
  "فريق العمل",
  "قسم مراقبة الجودة",
];

export default async function HomePage() {
  const [categories, products] = await Promise.all([
    getCategories(),
    getAllActiveProducts(),
  ]);

  const categoriesWithCount = categories.map((c) => ({
    category: c,
    count: products.filter((p) => p.category_id === c.id).length,
  }));

  return (
    <div className="mx-auto max-w-[640px] md:max-w-[1100px]">
      <SiteHeader />

      <div className="relative aspect-[4/5] w-full overflow-hidden bg-[repeating-linear-gradient(135deg,#1a2733,#1a2733_12px,#22323f_12px,#22323f_24px)] md:aspect-[21/9]">
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-black/35" />
        <div className="absolute right-4 top-3.5 rounded-md bg-black/45 px-2 py-1 font-mono text-[11px] text-white">
          فيديو: خط النفخ · 6 ثواني · بدون صوت
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
            <div className="h-0 w-0 border-y-[12px] border-l-[20px] border-y-transparent border-l-white" />
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 p-5">
          <div className="text-[26px] font-extrabold leading-tight text-white md:text-[44px]">
            مصنع قوارير بلاستيك — سطيف
          </div>
          <div className="mt-1.5 text-[15px] text-white/85 md:text-[20px]">
            PET · HDPE · تصنيع محلي
          </div>
        </div>
      </div>

      <WhatsAppButton
        source="home_cta"
        className="mx-4 my-4 flex min-h-12 items-center justify-center gap-2 rounded-[10px] bg-accent px-4 py-4 text-[17px] font-extrabold text-white shadow-[0_4px_14px_rgba(37,211,102,0.35)]"
      >
        اطلب عيّنة مجانية 🎁
      </WhatsAppButton>

      <div className="px-4 pb-1 pt-1 text-[13px] font-bold text-muted">تصفح حسب الفئة</div>
      <div className="grid grid-cols-2 gap-3 px-4 pb-5 md:grid-cols-4">
        {categoriesWithCount.map(({ category, count }) => (
          <CategoryCard key={category.id} category={category} count={count} />
        ))}
      </div>

      <div className="flex justify-around border-y border-border bg-surface px-4 py-[22px] text-center">
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

      <div className="px-4 pb-2 pt-5 text-[15px] font-extrabold">من داخل المصنع</div>
      <div className="flex gap-3 overflow-x-auto px-4 pb-6 pt-1">
        {FACTORY_PHOTOS.map((label) => (
          <div
            key={label}
            className="flex h-[110px] w-[150px] flex-none items-center justify-center rounded-[10px] border border-border bg-[repeating-linear-gradient(135deg,#F4F6F8,#F4F6F8_10px,#E9EDF1_10px,#E9EDF1_20px)]"
          >
            <div className="px-2 text-center font-mono text-[10px] text-muted">
              صورة: {label}
            </div>
          </div>
        ))}
      </div>

      <SiteFooter />
    </div>
  );
}
