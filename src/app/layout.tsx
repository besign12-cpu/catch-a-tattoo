import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/layout/BottomNav";

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
    "전 세계 타투이스트의 게스트워크 일정을 찾고 팔로우하는 플랫폼",
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
    description: "전 세계 타투이스트의 게스트워크 일정 플랫폼",
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={inter.variable}>
      <body>
        {children}
        <BottomNav />
      </body>
    </html>
  );
}
