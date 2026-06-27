import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import BottomNav from "@/components/layout/BottomNav";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Catch A Tattoo", template: "%s · Catch A Tattoo" },
  description: "Discover tattoo artists' Guest Work schedules worldwide",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Catch A Tattoo" },
  openGraph: {
    type: "website", siteName: "Catch A Tattoo",
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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value === "ko" ? "ko" : "en";

  return (
    <html lang={locale} className={inter.variable}>
      <body>
        {children}
        <BottomNav />
      </body>
    </html>
  );
}
