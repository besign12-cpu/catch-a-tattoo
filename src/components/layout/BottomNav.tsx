"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Heart, Calendar, User } from "lucide-react";
import { useSession } from "@/lib/hooks/useSession";
import { buildT } from "@/i18n/translations";
import type { Locale } from "@/i18n/config";

const NAV_HREFS = ["/", "/following", "/calendar", "/me"] as const;
const NAV_ICONS = [Compass, Heart, Calendar, User] as const;
const NAV_KEYS  = ["discover", "following", "calendar", "me"] as const;

/** pathname 기준 locale 판단 — 쿠키/SSR 의존 없음 */
function localeFromPath(pathname: string): Locale {
  return pathname === "/ko" || pathname.startsWith("/ko/") ? "ko" : "en";
}

/** /ko prefix 제거 → 실제 경로 */
function stripKo(pathname: string): string {
  if (pathname === "/ko") return "/";
  if (pathname.startsWith("/ko/")) return pathname.slice(3) || "/";
  return pathname;
}

/** locale prefix + href 합성 (trailing slash 방지) */
function withLocale(locale: Locale, href: string): string {
  if (locale === "en") return href;
  // href="/" → "/ko", href="/following" → "/ko/following"
  return href === "/" ? "/ko" : `/ko${href}`;
}

export default function BottomNav() {
  const pathname = usePathname();
  const { user, status } = useSession();

  // pathname 기준으로 locale 판단 (쿠키 불필요 — 항상 정확)
  const locale = localeFromPath(pathname);
  const t = buildT(locale, "nav");

  // 인증 페이지에서는 BottomNav 숨김
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
        {NAV_HREFS.map((href, i) => {
          const Icon  = NAV_ICONS[i];
          const label = t(NAV_KEYS[i]);

          // locale prefix 포함 링크 (trailing slash 없음)
          const targetHref = (() => {
            if (href !== "/me") return withLocale(locale, href);
            if (!user && status !== "loading") {
              // auth 페이지는 /ko 라우트 없음 → prefix 없이 이동
              // next 파라미터로 로그인 후 돌아갈 /ko/me 지정
              const nextPath = withLocale(locale, "/me");
              return `/auth/login?next=${encodeURIComponent(nextPath)}`;
            }
            return withLocale(locale, "/me");
          })();

          // active 판단: /ko prefix 제거 후 비교
          const isActive = (() => {
            if (href === "/") return normalPath === "/";
            if (href === "/me") {
              return (
                normalPath.startsWith("/me") ||
                (normalPath.startsWith("/artists/") &&
                  (normalPath.includes("/edit") ||
                    normalPath.includes("/schedule/") ||
                    normalPath.includes("/portfolio")))
              );
            }
            return normalPath.startsWith(href);
          })();

          return (
            <li key={href}>
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
