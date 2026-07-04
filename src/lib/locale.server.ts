/**
 * locale.server.ts — Server Component / Server Action 전용
 *
 * cookies()로 NEXT_LOCALE 읽어 locale과 localePrefix 반환.
 * middleware가 /ko/* 요청에서 request.headers Cookie에
 * NEXT_LOCALE=ko를 심으므로, 같은 요청의 서버 컴포넌트에서 정상 읽힘.
 *
 * 사용:
 *   const { locale, lp } = await getLocaleServer();
 *   href={`${lp}/me/settings`}
 */
import { cookies } from "next/headers";
import type { Locale } from "@/i18n/config";

export interface LocaleInfo {
  locale: Locale;
  /** locale prefix: "/ko" | "" */
  lp: string;
}

export async function getLocaleServer(): Promise<LocaleInfo> {
  const cookieStore = await cookies();
  const locale: Locale =
    cookieStore.get("NEXT_LOCALE")?.value === "ko" ? "ko" : "en";
  return { locale, lp: locale === "ko" ? "/ko" : "" };
}
