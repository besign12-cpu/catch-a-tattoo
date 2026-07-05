/**
 * locale.server.ts — Server Component / Server Action 전용
 *
 * x-locale 헤더(middleware 설정) 또는 NEXT_LOCALE 쿠키로 locale 판단.
 *
 * 사용:
 *   const { lp, href } = await getLocaleServer();
 *   redirect(href("/me/settings"))  → /ko/me/settings or /me/settings
 */
import { headers, cookies } from "next/headers";
import type { Locale } from "@/i18n/config";

export interface LocaleInfo {
  locale: Locale;
  lp: string;
  href: (path: string) => string;
}

export async function getLocaleServer(): Promise<LocaleInfo> {
  // 1순위: middleware가 /ko/* 요청마다 설정하는 x-locale 헤더
  const headerStore = await headers();
  const xLocale     = headerStore.get("x-locale");
  const locale: Locale =
    xLocale === "ko"
      ? "ko"
      : (await cookies()).get("NEXT_LOCALE")?.value === "ko"
      ? "ko"
      : "en";

  const lp = locale === "ko" ? "/ko" : "";

  function href(path: string): string {
    if (locale === "en") return path;
    if (path === "/") return "/ko";
    return `/ko${path}`;
  }

  return { locale, lp, href };
}
