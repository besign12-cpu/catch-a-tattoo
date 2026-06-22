/**
 * i18n 설정
 * 기본 언어: English (/)
 * 한국어: /ko
 *
 * 번역 제외 고유 개념어:
 * Guest Work / Bring / Bring This Artist / Follow / Based City /
 * Artist Profile / Discovery / Demand Signal / CAT
 */

export const locales = ["en", "ko"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

/** locale → 표시 언어명 */
export const localeNames: Record<Locale, string> = {
  en: "English",
  ko: "한국어",
};

/** locale이 유효한지 확인 */
export function isValidLocale(locale: string): locale is Locale {
  return (locales as readonly string[]).includes(locale);
}
