import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import "../globals.css";

const notoSansJp = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-noto-sans-jp",
  display: "swap",
});

export const metadata: Metadata = {
  title: "シゴトドキ — 在日外国人のための履歴書・職務経歴書ビルダー",
  description:
    "在留資格や母語にあわせて、日本企業に出せる履歴書・職務経歴書をかんたんに作成し、PDFで出力できます。",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// Pages read from the database (PGlite) at request time, so they must render
// dynamically rather than be prerendered at build.
export const dynamic = "force-dynamic";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  return (
    <html lang={locale} className={`${notoSansJp.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
