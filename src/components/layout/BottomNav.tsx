"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, MapPin, Bell, User } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", icon: Home, label: "홈" },
  { href: "/search", icon: Search, label: "검색" },
  { href: "/map", icon: MapPin, label: "지도" },
  { href: "/notifications", icon: Bell, label: "알림", hasNotif: true },
  { href: "/me", icon: User, label: "내 정보" },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-neutral-100 bg-white"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="하단 내비게이션"
    >
      <div className="mx-auto flex h-[52px] max-w-mobile items-center justify-around px-1">
        {NAV_ITEMS.map(({ href, icon: Icon, label, hasNotif }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative flex flex-1 flex-col items-center justify-center gap-0.5 py-1 transition-colors",
                active ? "text-neutral-900" : "text-neutral-400"
              )}
              aria-current={active ? "page" : undefined}
            >
              <div className="relative">
                <Icon
                  size={22}
                  strokeWidth={active ? 2 : 1.5}
                  aria-hidden="true"
                />
                {hasNotif && (
                  <span
                    className="absolute -right-0.5 -top-0.5 h-[7px] w-[7px] rounded-full bg-red-500"
                    aria-label="읽지 않은 알림 있음"
                  />
                )}
              </div>
              <span className="text-[10px] font-medium leading-none">
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
