import Image from "next/image";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import CategoryCard from "@/components/CategoryCard";
import WhatsAppButton from "@/components/WhatsAppButton";
import { company } from "@/lib/company";
import { volumeLabel } from "@/lib/variants";
import { getCatalogSummary, getCategories } from "@/lib/products";

export const revalidate = 3600;

const WHY = [
  {
    icon: "🏭",
    title: "تصنيع محلي في سطيف",
    body: "الإنتاج يتم في الجزائر، بدون استيراد ولا انتظار جمركة.",
  },
  {
    icon: "📐",
    title: "مواصفات تقنية واضحة",
    body: "الحجم والوزن والمادة ونوع السدادة مذكورة لكل مرجع.",
  },
  {
    icon: "🧩",
    title: "تشكيلة واسعة",
    body: "أشكال وأحجام وأوزان مختلفة حسب حاجة كل نشاط.",
  },
  {
    icon: "💬",
    title: "تواصل مباشر",
    body: "استفسارك يصل مباشرة عبر واتساب، بدون وسطاء.",
  },
];


export default async function HomePage() {
  const [categories, summary] = await Promise.all([getCategories(), getCatalogSummary()]);


  const volumeRange =
    summary.minVolumeMl != null && summary.maxVolumeMl != null
      ? `${volumeLabel(summary.minVolumeMl)} → ${volumeLabel(summary.maxVolumeMl)}`
      : null;

  const facts = [
    "🇩🇿 تصنيع في الجزائر",
    `📍 ${company.city}`,
    `♻️ ${company.materials.join(" · ")}`,
    ...(volumeRange ? [`📏 ${volumeRange}`] : []),
    `📦 طلبيات من ${company.minOrderQty} وحدة`,
  ];

  return (
    <>
      <SiteHeader />

      {/* ---------- HERO ---------- */}
      <section className="bg-brand text-white">
        <div className="mx-auto grid max-w-[1100px] items-center gap-7 px-4 py-9 md:grid-cols-2 md:gap-10 md:py-14">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[12px] font-bold text-white/90">
              <span aria-hidden>📍</span> {company.city} • {company.country}
            </div>

            <h1 className="mt-3.5 text-[27px] font-extrabold leading-[1.25] md:text-[42px]">
              مصنع قوارير بلاستيكية
              <br />
              PET و HDPE في الجزائر
            </h1>

            <p className="mt-3.5 max-w-[460px] text-[15px] leading-8 text-white/80 md:text-[17px]">
              تشكيلة قوارير وحلول تعبئة موجّهة لمحترفي المنظفات، المواد الغذائية،
              الخل، المستلزمات الطبية وغيرها.
            </p>

            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
              <Link
                href="#categories"
                className="flex min-h-12 items-center justify-center rounded-[10px] bg-white px-6 text-[16px] font-extrabold text-brand"
              >
                تصفح الكتالوج
              </Link>
              <WhatsAppButton
                source="home_cta"
                className="flex min-h-12 items-center justify-center gap-2 rounded-[10px] bg-accent px-6 text-[16px] font-extrabold text-white"
              >
                <span aria-hidden>💬</span> اطلب عرض سعر
              </WhatsAppButton>
            </div>
          </div>

          {/* Landscape crop on phones so the photo cannot swallow the fold,
              portrait on desktop where there is room beside the copy.
              object-cover with the focal point low-centre keeps the row of
              bottles in frame at both ratios. */}
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl md:aspect-[3/4] md:max-w-[380px] md:justify-self-end">
            <Image
              src="/hero.webp"
              alt="قوارير بلاستيكية PET و HDPE من إنتاج ILYA PLAST"
              fill
              priority
              sizes="(min-width: 768px) 380px, 100vw"
              className="object-cover object-[50%_58%]"
            />
          </div>
        </div>
      </section>

      {/* ---------- TRUST / FACTS ---------- */}
      <section className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-[1100px] flex-wrap justify-center gap-x-6 gap-y-2.5 px-4 py-4 text-[13px] font-bold text-muted md:justify-between">
          {facts.map((f) => (
            <span key={f}>{f}</span>
          ))}
        </div>
      </section>

      {/* ---------- CATEGORIES ---------- */}
      <section id="categories" className="scroll-mt-20">
        <div className="mx-auto max-w-[1100px] px-4 py-9">
          <h2 className="text-[21px] font-extrabold text-text md:text-[26px]">
            اكتشف تشكيلة القوارير
          </h2>
          <p className="mt-2 max-w-[560px] text-[14px] leading-7 text-muted">
            تصفح المراجع حسب الاستعمال ولقى الحجم المناسب لنشاطك.
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                count={summary.counts[category.id] ?? 0}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ---------- WHY ---------- */}
      <section>
        <div className="mx-auto max-w-[1100px] px-4 py-9">
          <h2 className="text-[21px] font-extrabold text-text md:text-[26px]">
            لماذا {company.name}؟
          </h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
            {WHY.map((item) => (
              <div key={item.title} className="rounded-xl border border-border p-4">
                <div className="text-[26px] leading-none" aria-hidden>
                  {item.icon}
                </div>
                <div className="mt-2.5 text-[15px] font-extrabold text-text">{item.title}</div>
                <p className="mt-1.5 text-[13px] leading-7 text-muted">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- COMPANY ---------- */}
      <section className="border-y border-border bg-surface">
        <div className="mx-auto max-w-[1100px] px-4 py-9">
          <h2 className="text-[21px] font-extrabold text-text md:text-[26px]">
            وجود صناعي في {company.city}
          </h2>
          <p className="mt-2.5 max-w-[620px] text-[14px] leading-8 text-muted">
            {company.name} مصنع متخصص في القوارير البلاستيكية PET و HDPE، موجّه
            لأصحاب المصانع والموزّعين عبر الوطن.
            {summary.total > 0 && ` التشكيلة الحالية ${summary.total} مرجع`}
            {volumeRange && ` بأحجام من ${volumeRange}`}.
          </p>
          <div className="mt-5 flex flex-wrap gap-2.5">
            <Link
              href="/about"
              className="flex min-h-11 items-center rounded-[10px] border border-brand px-5 text-[14px] font-bold text-brand"
            >
              اكتشف {company.name}
            </Link>
            <a
              href={company.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-11 items-center gap-1.5 rounded-[10px] border border-border bg-bg px-5 text-[14px] font-bold text-text"
            >
              <span aria-hidden>📍</span> موقع المصنع
            </a>
          </div>
        </div>
      </section>

      {/* ---------- FINAL CTA ---------- */}
      <section className="bg-brand text-white">
        <div className="mx-auto max-w-[1100px] px-4 py-10 text-center">
          <h2 className="text-[21px] font-extrabold md:text-[26px]">عندك حاجة للقوارير؟</h2>
          <p className="mx-auto mt-2.5 max-w-[460px] text-[14px] leading-7 text-white/80">
            تكلّم مباشرة مع فريقنا واطلب عرض سعر أو عيّنة مجانية.
          </p>
          <WhatsAppButton
            source="home_cta"
            className="mx-auto mt-5 flex min-h-12 w-full max-w-[320px] items-center justify-center gap-2 rounded-[10px] bg-accent px-6 text-[16px] font-extrabold text-white"
          >
            <span aria-hidden>💬</span> اطلب عرض سعر عبر واتساب
          </WhatsAppButton>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
