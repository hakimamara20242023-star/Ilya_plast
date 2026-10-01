import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import MetaPixel from "@/components/MetaPixel";
import PixelRouteTracker from "@/components/PixelRouteTracker";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["400", "700", "800"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://ilya-plast.vercel.app";

const TITLE = "ILYA PLAST — مصنع قوارير بلاستيك PET و HDPE، سطيف";
const DESCRIPTION =
  "ILYA PLAST مصنع جزائري للقوارير البلاستيكية PET و HDPE في سطيف. تصفح الكتالوج واطلب عرض سعر عبر واتساب.";

export const metadata: Metadata = {
  // metadataBase makes every relative OG/canonical URL in the app absolute.
  metadataBase: new URL(SITE_URL),
  title: { default: TITLE, template: "%s | ILYA PLAST" },
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "ILYA PLAST",
    locale: "ar_DZ",
    url: "/",
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: "/logo.webp", width: 480, height: 314, alt: "ILYA PLAST" }],
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable}`}>
      <body className="min-h-screen bg-bg text-text antialiased">
        <MetaPixel />
        <Suspense fallback={null}>
          <PixelRouteTracker />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
