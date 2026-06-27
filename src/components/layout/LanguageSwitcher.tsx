"use client";

import { usePathname } from "next/navigation";
import { locales, localeNames, type Locale } from "@/i18n/config";
import { getClientLocale } from "@/i18n/translations";

interface Props {
  variant?: "topbar" | "settings";
}

export function LanguageSwitcher({ variant = "topbar" }: Props) {
  const pathname = usePathname();
  const locale: Locale = getClientLocale();

  function handleSwitch(next: Locale) {
    if (next === locale) return;

    let target: string;
    if (next === "ko") {
      // 현재 /path → /ko/path
      target = pathname === "/" ? "/ko" : `/ko${pathname}`;
    } else {
      // 현재 /ko/path → /path
      if (pathname === "/ko") target = "/";
      else if (pathname.startsWith("/ko/")) target = pathname.slice(3) || "/";
      else target = pathname;
    }

    // window.location: 서버에서 미들웨어가 쿠키 설정 + 실제 /ko 라우트 렌더
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
