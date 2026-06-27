"use client";

/**
 * LanguageSwitcher
 *
 * 언어 전환 방식:
 * 1. /ko 또는 /en URL로 이동
 * 2. middleware가 NEXT_LOCALE 쿠키 설정 후 / 로 리다이렉트
 * 3. localStorage에도 저장 (탭 간 동기화)
 * 4. 서버에서 NEXT_LOCALE 쿠키 기준으로 locale 결정
 */

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { locales, localeNames, type Locale } from "@/i18n/config";

const LS_KEY = "CAT_LOCALE";

/** localStorage에서 locale 읽기 */
function getLocaleFromStorage(): Locale {
  if (typeof localStorage === "undefined") return "en";
  const val = localStorage.getItem(LS_KEY);
  return val === "ko" ? "ko" : "en";
}

/** 현재 locale 감지 (쿠키 우선, localStorage 보조) */
function detectCurrentLocale(): Locale {
  if (typeof document === "undefined") return "en";
  // 쿠키에서 읽기
  const cookieMatch = document.cookie.match(/NEXT_LOCALE=([^;]+)/);
  const cookieVal   = cookieMatch?.[1];
  if (cookieVal === "ko" || cookieVal === "en") return cookieVal;
  // localStorage 보조
  return getLocaleFromStorage();
}

interface LanguageSwitcherProps {
  currentLocale?: Locale;
  variant?: "topbar" | "settings";
}

export function LanguageSwitcher({
  currentLocale,
  variant = "topbar",
}: LanguageSwitcherProps) {
  const router = useRouter();
  const locale = currentLocale ?? (
    typeof window !== "undefined" ? detectCurrentLocale() : "en"
  );

  const handleSwitch = useCallback(
    (next: Locale) => {
      if (next === locale) return;
      // localStorage 저장 (영속화)
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(LS_KEY, next);
      }
      // /ko 또는 /en 으로 이동 → middleware가 쿠키 설정 + 홈 리다이렉트
      router.push(`/${next}`);
    },
    [locale, router]
  );

  // TopBar 변형: EN | KO 토글
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

  // Settings 변형: 라디오 스타일
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
            <svg
              width="16" height="16" viewBox="0 0 24 24"
              fill="none" stroke="currentColor"
              strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </button>
      ))}
    </div>
  );
}
