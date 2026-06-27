import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";
import { defaultLocale, isValidLocale, type Locale } from "./config";

/**
 * next-intl 서버 설정
 *
 * locale 결정 순서:
 * 1. NEXT_LOCALE 쿠키 (middleware가 /ko 진입 시 설정, LanguageSwitcher도 설정)
 * 2. 기본값: en
 *
 * - URL prefix 방식: /ko → middleware → NEXT_LOCALE=ko 쿠키 → 홈으로 리다이렉트
 * - 자동 감지 없음 (Accept-Language 무시)
 * - localStorage로 영속화 (LanguageSwitcher에서 처리)
 */
export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("NEXT_LOCALE")?.value;

  const locale: Locale =
    cookieLocale && isValidLocale(cookieLocale) ? cookieLocale : defaultLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
