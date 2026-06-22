import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";
import { defaultLocale, isValidLocale, type Locale } from "./config";

/**
 * next-intl 서버 설정
 * URL prefix(/ko) → cookie → Accept-Language → 기본값(en) 순으로 locale 결정
 */
export default getRequestConfig(async () => {
  // 1. 쿠키에서 locale 읽기 (Language Switcher가 저장)
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("CAT_LOCALE")?.value;
  if (cookieLocale && isValidLocale(cookieLocale)) {
    const locale: Locale = cookieLocale;
    return {
      locale,
      messages: (await import(`../../messages/${locale}.json`)).default,
    };
  }

  // 2. Accept-Language 헤더 확인
  const headerStore = await headers();
  const acceptLang = headerStore.get("accept-language") ?? "";
  const preferred = acceptLang.split(",")[0]?.split("-")[0]?.toLowerCase();
  if (preferred && isValidLocale(preferred)) {
    const locale: Locale = preferred;
    return {
      locale,
      messages: (await import(`../../messages/${locale}.json`)).default,
    };
  }

  // 3. 기본값: English
  return {
    locale: defaultLocale,
    messages: (await import(`../../messages/${defaultLocale}.json`)).default,
  };
});
