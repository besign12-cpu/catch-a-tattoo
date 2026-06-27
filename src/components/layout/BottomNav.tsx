"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Compass, Heart, Calendar, User } from "lucide-react";
import { useSession } from "@/lib/hooks/useSession";

const NAV_HREFS = ["/", "/following", "/calendar", "/me"] as const;
const NAV_ICONS = [Compass, Heart, Calendar, User] as const;
const NAV_KEYS  = ["discover", "following", "calendar", "me"] as const;

export default function BottomNav() {
  const pathname = usePathname();
  const { user, status } = useSession();
  const t = useTranslations("nav");

  // 인증 페이지에서는 BottomNav 숨김
  if (pathname.startsWith("/auth/")) return null;

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

          // /ko/* 경로에서도 올바른 locale prefix 붙이기
          const isKo = pathname.startsWith("/ko");
          const prefix = isKo ? "/ko" : "";

          // 나 탭 분기
          const targetHref = (() => {
            if (href !== "/me") return `${prefix}${href}`;
            if (!user && status !== "loading") return `${prefix}/auth/login`;
            return `${prefix}/me`;
          })();

          // 활성 상태 판단 (/ko prefix 제거 후 비교)
          const normalPath = pathname.startsWith("/ko")
            ? pathname.slice(3) || "/"
            : pathname;

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
                className="
                  flex flex-col items-center gap-0.5 px-3 py-2
                  transition-colors
                "
              >
                <span className="relative">
                  <Icon
                    size={22}
                    strokeWidth={isActive ? 2.2 : 1.6}
                    className={isActive ? "text-white" : "text-white/35"}
                  />
                </span>
                <span
                  className={`text-[10px] leading-none ${
                    isActive ? "text-white" : "text-white/35"
                  }`}
                >
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
