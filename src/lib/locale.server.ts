/**
 * locale.server.ts — Server Component / Server Action 전용
 *
 * locale 판단 우선순위:
 * 1. x-locale 헤더 (middleware가 /ko/* 요청마다 설정, 쿠키 없어도 확실)
 * 2. NEXT_LOCALE 쿠키 (이전 방문에서 설정된 경우)
 * 3. 기본값 "en"
 *
 * 사용:
 *   const { locale, lp } = await getLocaleServer();
 *   href={`${lp}/me/settings`}  // KO → /ko/me/settings
 */
import { headers, cookies } from "next/headers";
import type { Locale } from "@/i18n/config";

export interface LocaleInfo {
  locale: Locale;
  /** "/ko" | "" */
  lp: string;
}

export async function getLocaleServer(): Promise<LocaleInfo> {
  // 1순위: middleware가 설정한 x-locale 헤더 (쿠키보다 먼저 확인)
  const headerStore = await headers();
  const xLocale = headerStore.get("x-locale");
  if (xLocale === "ko") return { locale: "ko", lp: "/ko" };
  if (xLocale === "en") return { locale: "en", lp: "" };

  // 2순위: 브라우저 쿠키
  const cookieStore = await cookies();
  const locale: Locale =
    cookieStore.get("NEXT_LOCALE")?.value === "ko" ? "ko" : "en";
  return { locale, lp: locale === "ko" ? "/ko" : "" };
}
