"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Heart, Calendar, User } from "lucide-react";
import { useSession } from "@/lib/hooks/useSession";
import { buildT } from "@/i18n/translations";
import type { Locale } from "@/i18n/config";

// ── 헬퍼 ─────────────────────────────────────────────────────

/** pathname → locale 판단 (쿠키/SSR 의존 없이 항상 정확) */
function localeFromPath(pathname: string): Locale {
  return pathname === "/ko" || pathname.startsWith("/ko/") ? "ko" : "en";
}

/** /ko prefix 제거 → 실제 경로 */
function stripKo(pathname: string): string {
  if (pathname === "/ko") return "/";
  if (pathname.startsWith("/ko/")) return pathname.slice(3) || "/";
  return pathname;
}

/** locale prefix + base href 조합 (trailing slash 방지) */
function withLocale(locale: Locale, base: string): string {
  if (locale === "en") return base;
  return base === "/" ? "/ko" : `/ko${base}`;
}

// ── 탭 정의 ──────────────────────────────────────────────────
const NAV_HREFS  = ["/", "/following", "/calendar", "/me"] as const;
const NAV_ICONS  = [Compass, Heart, Calendar, User]        as const;
const NAV_KEYS   = ["discover", "following", "calendar", "me"] as const;

// ── 컴포넌트 ─────────────────────────────────────────────────

export default function BottomNav() {
  const pathname = usePathname();
  const { user, status } = useSession();

  // pathname 기준 locale — 항상 정확, SSR safe
  const locale  = localeFromPath(pathname);
  const t       = buildT(locale, "nav");

  // 인증 페이지에서는 숨김
  if (pathname.startsWith("/auth/")) return null;

  // /ko prefix 제거한 실제 경로 (active 판단용)
  const normalPath = stripKo(pathname);

  return (
    <nav
      className="
        fixed bottom-0 left-1/2 -translate-x-1/2
        w-full max-w-[430px]
        bg-cat-black/95 backdrop-blur-sm
        border-t border-white/5
        pb-safe
      "
      aria-label="하단 네비게이션"
    >
      <ul className="flex items-center justify-around px-2 h-16">
        {NAV_HREFS.map((base, i) => {
          const Icon  = NAV_ICONS[i];
          const label = t(NAV_KEYS[i]);

          // locale prefix 포함 href — /ko 상태면 /ko/following 등
          const targetHref = (() => {
            if (base !== "/me") return withLocale(locale, base);
            // 비로그인: /auth/login?next=/ko/me (locale 유지)
            if (!user && status !== "loading") {
              const nextPath = withLocale(locale, "/me");
              return `/auth/login?next=${encodeURIComponent(nextPath)}`;
            }
            return withLocale(locale, "/me");
          })();

          // active 판단: /ko prefix 제거 후 비교
          const isActive = (() => {
            if (base === "/")   return normalPath === "/";
            if (base === "/me") {
              return (
                normalPath.startsWith("/me") ||
                (normalPath.startsWith("/artists/") &&
                  (normalPath.includes("/edit") ||
                    normalPath.includes("/schedule/") ||
                    normalPath.includes("/portfolio")))
              );
            }
            return normalPath.startsWith(base);
          })();

          return (
            <li key={base}>
              <Link
                href={targetHref}
                aria-label={label}
                className="flex flex-col items-center gap-0.5 px-3 py-2 transition-colors"
              >
                <span className="relative">
                  <Icon
                    size={22}
                    strokeWidth={isActive ? 2.2 : 1.6}
                    className={isActive ? "text-white" : "text-white/35"}
                  />
                </span>
                <span className={`text-[10px] leading-none ${isActive ? "text-white" : "text-white/35"}`}>
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
