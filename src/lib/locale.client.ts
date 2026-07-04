/**
 * locale.client.ts — Client Component 전용 (훅 아님, 순수 함수)
 *
 * usePathname()이 없는 유틸 컨텍스트용.
 * pathname 기반 locale 판단 함수.
 *
 * 훅이 필요하면 useT.ts / LanguageSwitcher에서 usePathname() 직접 사용.
 */
import type { Locale } from "@/i18n/config";

export function localeFromPath(pathname: string): Locale {
  return pathname === "/ko" || pathname.startsWith("/ko/") ? "ko" : "en";
}

export function lpFromPath(pathname: string): string {
  return localeFromPath(pathname) === "ko" ? "/ko" : "";
}
