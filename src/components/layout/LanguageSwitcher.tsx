"use client";

import { usePathname } from "next/navigation";
import { locales, localeNames, type Locale } from "@/i18n/config";

interface Props {
  variant?: "topbar" | "settings";
}

/** pathname 기준으로 현재 locale 판단 (쿠키 미사용) */
function localeFromPath(pathname: string): Locale {
  return pathname === "/ko" || pathname.startsWith("/ko/") ? "ko" : "en";
}

/** /ko prefix 제거 */
function stripKo(pathname: string): string {
  if (pathname === "/ko") return "/";
  if (pathname.startsWith("/ko/")) return pathname.slice(3) || "/";
  return pathname;
}

export function LanguageSwitcher({ variant = "topbar" }: Props) {
  const pathname = usePathname();
  const locale   = localeFromPath(pathname);

  function handleSwitch(next: Locale) {
    if (next === locale) return; // 이미 해당 locale — 이동 없음

    let target: string;
    if (next === "ko") {
      // en → ko: /path → /ko/path, / → /ko
      const base = stripKo(pathname); // 혹시라도 /ko prefix 있으면 제거
      target = base === "/" ? "/ko" : `/ko${base}`;
    } else {
      // ko → en: /ko/path → /path, /ko → /
      target = stripKo(pathname);
    }

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
              fill="none" stroke="currentColor" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </button>
      ))}
    </div>
  );
}
