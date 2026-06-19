"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Heart, Calendar, User } from "lucide-react";
import { useSession } from "@/lib/hooks/useSession";

const NAV_ITEMS: Array<{
  href: string;
  icon: React.ElementType;
  label: string;
}> = [
  { href: "/",          icon: Compass,  label: "Discover" },
  { href: "/following", icon: Heart,    label: "팔로우"   },
  { href: "/calendar",  icon: Calendar, label: "캘린더"   },
  { href: "/me",        icon: User,     label: "나"        },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { user, status } = useSession();

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
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          // 나 탭 분기
          // - 비로그인 → /auth/login
          // - 로그인(role 무관) → /me
          //   Artist는 /me에서 Studio CTA로 이동
          const targetHref = (() => {
            if (href !== "/me") return href;
            if (!user && status !== "loading") return "/auth/login";
            return "/me";
          })();

          // 활성 상태 판단
          // 나 탭: /me 또는 /studio 경로 모두 활성
          const isActive = (() => {
            if (href === "/") return pathname === "/";
            if (href === "/me") {
              return pathname.startsWith("/me") || pathname.startsWith("/studio");
            }
            return pathname.startsWith(href);
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
