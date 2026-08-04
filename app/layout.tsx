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

export const metadata: Metadata = {
  title: "ILYA PLAST — مصنع قوارير بلاستيك، سطيف",
  description:
    "ILYA PLAST — مصنع قوارير PET و HDPE في سطيف، الجزائر. أكثر من 50 موديل من 60ml إلى 5L. للشراء بالجملة تواصل معنا عبر واتساب.",
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
