"use client";

/**
 * LanguageSwitcher
 *
 * 언어 전환 방식:
 * - /ko/[현재경로] 또는 /en/[현재경로] 로 이동
 * - middleware가 NEXT_LOCALE 쿠키 설정 + rewrite로 실제 페이지 렌더
 * - localStorage에도 저장 (영속화)
 * - 현재 경로 유지 (/ → /ko, /following → /ko/following)
 */

import { usePathname } from "next/navigation";
import { locales, localeNames, type Locale } from "@/i18n/config";

const LS_KEY = "CAT_LOCALE";

/** 현재 locale 감지 (쿠키 우선) */
function detectCurrentLocale(): Locale {
  if (typeof document === "undefined") return "en";
  const m = document.cookie.match(/NEXT_LOCALE=([^;]+)/);
  const v = m?.[1];
  if (v === "ko" || v === "en") return v;
  if (typeof localStorage !== "undefined") {
    const ls = localStorage.getItem(LS_KEY);
    if (ls === "ko" || ls === "en") return ls;
  }
  return "en";
}

/** pathname에서 locale prefix 제거 */
function stripLocale(pathname: string): string {
  if (pathname.startsWith("/ko/")) return pathname.slice(3);
  if (pathname === "/ko") return "/";
  if (pathname.startsWith("/en/")) return pathname.slice(3);
  if (pathname === "/en") return "/";
  return pathname;
}

interface LanguageSwitcherProps {
  currentLocale?: Locale;
  variant?: "topbar" | "settings";
}

export function LanguageSwitcher({
  currentLocale,
  variant = "topbar",
}: LanguageSwitcherProps) {
  const pathname = usePathname();
  const locale: Locale =
    currentLocale ??
    (typeof window !== "undefined" ? detectCurrentLocale() : "en");

  function handleSwitch(next: Locale) {
    if (next === locale) return;
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(LS_KEY, next);
    }
    // 현재 경로에서 locale prefix 제거 후 새 locale prefix 붙이기
    const basePath = stripLocale(pathname);
    const target =
      next === "en"
        ? basePath                       // en: /following
        : `/ko${basePath === "/" ? "" : basePath}`; // ko: /ko/following

    window.location.href = target;
  }

  if (variant === "topbar") {
    return (
      <div className="flex items-center gap-0.5 rounded-lg border border-neutral-200 overflow-hidden">
        {locales.map((loc) => (
          <button
            key={loc}
            onClick={() => handleSwitch(loc)}
            className={[
              "px-2 py-1 text-[11px] font-medium transition-colors",
              locale === loc
                ? "bg-neutral-900 text-white"
                : "bg-white text-neutral-400 hover:text-neutral-700",
            ].join(" ")}
            aria-label={`Switch to ${localeNames[loc]}`}
            aria-pressed={locale === loc}
          >
            {loc.toUpperCase()}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {locales.map((loc) => (
        <button
          key={loc}
          onClick={() => handleSwitch(loc)}
          className={[
            "flex items-center justify-between rounded-xl border px-4 py-3 transition-colors",
            locale === loc
              ? "border-neutral-900 bg-neutral-900 text-white"
              : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300",
          ].join(" ")}
          aria-pressed={locale === loc}
        >
          <span className="text-sm font-medium">{localeNames[loc]}</span>
          {locale === loc && (
            <svg width="16" height="16" viewBox="0 0 24 24"
              fill="none" stroke="currentColor"
              strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              aria-hidden="true">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </button>
      ))}
    </div>
  );
}
