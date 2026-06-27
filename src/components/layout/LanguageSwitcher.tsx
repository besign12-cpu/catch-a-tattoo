"use client";

/**
 * LanguageSwitcher
 *
 * - 현재 경로 유지하며 locale prefix만 전환
 * - /following → KO 클릭 → /ko/following
 * - /ko/following → EN 클릭 → /following
 * - NEXT_LOCALE 쿠키: middleware가 설정 (rewrite 시)
 * - localStorage: 탭 간 동기화 (선택적)
 */

import { usePathname } from "next/navigation";
import { locales, localeNames, type Locale } from "@/i18n/config";
import { getClientLocale } from "@/i18n/translations";

const LS_KEY = "CAT_LOCALE";

/** 현재 locale prefix 제거 */
function stripLocale(path: string): string {
  if (path === "/ko") return "/";
  if (path.startsWith("/ko/")) return path.slice(3) || "/";
  if (path === "/en") return "/";
  if (path.startsWith("/en/")) return path.slice(3) || "/";
  return path;
}

interface Props {
  variant?: "topbar" | "settings";
}

export function LanguageSwitcher({ variant = "topbar" }: Props) {
  const pathname = usePathname();
  const locale: Locale = getClientLocale();

  function handleSwitch(next: Locale) {
    if (next === locale) return;
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(LS_KEY, next);
    }
    // 현재 경로에서 locale prefix 제거 후 새 prefix 붙이기
    const base   = stripLocale(pathname);
    const target = next === "en"
      ? base
      : `/ko${base === "/" ? "" : base}`;

    // window.location 사용: 서버에서 쿠키 재설정 후 새 locale로 렌더
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
