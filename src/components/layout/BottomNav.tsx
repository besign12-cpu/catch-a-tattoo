"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Heart, MapPin, Bell, User } from "lucide-react";
import { useSession } from "@/lib/hooks/useSession";

const NAV_ITEMS: Array<{
  href: string;
  icon: React.ElementType;
  label: string;
}> = [
  { href: "/",             icon: Search, label: "검색"   },
  { href: "/following",   icon: Heart,  label: "팔로우" },
  { href: "/map",         icon: MapPin, label: "지역"   },
  { href: "/notifications", icon: Bell, label: "알림"   },
  { href: "/me",          icon: User,   label: "내 정보" },
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
          // /me 탭: 비로그인 시 /auth/login으로 이동
          const targetHref =
            href === "/me" && !user && status !== "loading"
              ? "/auth/login"
              : href;

          const isActive =
            href === "/"
              ? pathname === "/"
              : pathname.startsWith(href);

          // 알림 점 표시 (로그인 상태에서만)
          const showNotifDot = href === "/notifications" && !!user;

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
                    className={
                      isActive ? "text-white" : "text-white/35"
                    }
                  />
                  {showNotifDot && (
                    <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-red-500" />
                  )}
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
