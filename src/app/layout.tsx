import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { getLocale, getMessages } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import "./globals.css";
import BottomNav from "@/components/layout/BottomNav";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Catch A Tattoo",
    template: "%s · Catch A Tattoo",
  },
  description:
    "Discover tattoo artists' Guest Work schedules worldwide",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Catch A Tattoo",
  },
  openGraph: {
    type: "website",
    siteName: "Catch A Tattoo",
    title: "Catch A Tattoo",
    description: "Discover tattoo artists' Guest Work schedules worldwide",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale   = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} className={inter.variable}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
          <BottomNav />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
