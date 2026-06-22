"use client";

/**
 * LanguageSwitcher
 *
 * - CAT_LOCALE 쿠키를 설정하고 페이지를 새로고침
 * - URL prefix 방식이 아닌 쿠키 기반 locale 전환
 * - Discover TopBar 우상단에 위치 (비로그인 접근 가능)
 * - /me/settings Language 섹션에서도 재사용 가능
 */

import { useCallback, useState } from "react";
import { locales, localeNames, type Locale } from "@/i18n/config";

interface LanguageSwitcherProps {
  /** 현재 locale (서버에서 내려줌) */
  currentLocale?: Locale;
  /** 버튼 스타일 변형 */
  variant?: "topbar" | "settings";
}

/** 쿠키에서 현재 locale 읽기 */
function getLocaleFromCookie(): Locale {
  if (typeof document === "undefined") return "en";
  const match = document.cookie.match(/CAT_LOCALE=([^;]+)/);
  const val = match?.[1];
  return val === "ko" ? "ko" : "en";
}

/** CAT_LOCALE 쿠키 설정 (1년) */
function setLocaleCookie(locale: Locale) {
  const expires = new Date();
  expires.setFullYear(expires.getFullYear() + 1);
  document.cookie = `CAT_LOCALE=${locale};path=/;expires=${expires.toUTCString()};SameSite=Lax`;
}

export function LanguageSwitcher({
  currentLocale,
  variant = "topbar",
}: LanguageSwitcherProps) {
  const [locale, setLocaleState] = useState<Locale>(
    currentLocale ?? (typeof window !== "undefined" ? getLocaleFromCookie() : "en")
  );

  const handleSwitch = useCallback(
    (next: Locale) => {
      if (next === locale) return;
      setLocaleState(next);
      setLocaleCookie(next);
      // 현재 페이지 새로고침으로 서버에서 새 locale 적용
      window.location.reload();
    },
    [locale]
  );

  // TopBar 변형: 현재 언어 코드 + 드롭다운
  if (variant === "topbar") {
    return (
      <div className="relative flex items-center">
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
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
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
