"use client";

/**
 * MeLinks
 *
 * Me 페이지의 locale-aware 링크들을 담당하는 Client Component.
 * usePathname()으로 /ko/* 여부를 판단 → 항상 정확한 prefix.
 *
 * 서버 컴포넌트에서 cookies/headers로 locale 추측하는 방식은
 * 쿠키 타이밍 문제로 불안정하므로 이 방식으로 통일.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings, LayoutDashboard } from "lucide-react";
import { useT } from "@/lib/hooks/useT";
import { signOut } from "@/actions/auth";

function lp(pathname: string): string {
  return pathname === "/ko" || pathname.startsWith("/ko/") ? "/ko" : "";
}

export function ArtistProfileLink({ handle, desc }: { handle: string; desc: string }) {
  const pathname = usePathname();
  const prefix   = lp(pathname);
  const t        = useT("artist");

  return (
    <Link
      href={`${prefix}/artists/${handle}`}
      className="flex items-center justify-between rounded-2xl bg-neutral-900 px-5 py-4 hover:opacity-90 active:opacity-80 transition-opacity"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
          <LayoutDashboard size={16} className="text-white" aria-hidden="true" />
        </div>
        <div className="flex flex-col gap-0.5">
          <p className="text-[13px] font-semibold text-white leading-tight">
            @{handle} {t("profile")}
          </p>
          <p className="text-[11px] text-neutral-400 leading-tight">{desc}</p>
        </div>
      </div>
      <span className="text-xs text-neutral-400">→</span>
    </Link>
  );
}

export function SettingsLink() {
  const pathname = usePathname();
  const prefix   = lp(pathname);
  const tc       = useT("common");

  return (
    <Link
      href={`${prefix}/me/settings`}
      className="flex items-center justify-between rounded-2xl bg-white border border-neutral-100 px-5 py-4 hover:border-neutral-200 transition-colors"
    >
      <div className="flex items-center gap-2.5">
        <Settings size={16} className="text-neutral-400" aria-hidden="true" />
        <span className="text-sm font-medium text-neutral-700">{tc("settings")}</span>
      </div>
      <span className="text-xs text-neutral-300">→</span>
    </Link>
  );
}

export function SettingsIconLink() {
  const pathname = usePathname();
  const prefix   = lp(pathname);
  const tc       = useT("common");

  return (
    <Link
      href={`${prefix}/me/settings`}
      className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100 transition-colors"
      aria-label={tc("settings")}
    >
      <Settings size={18} />
    </Link>
  );
}

export function LogoutButton() {
  const tc = useT("common");
  return (
    <form action={signOut} className="mt-1">
      <button
        type="submit"
        className="w-full rounded-2xl border border-neutral-200 bg-white py-4 text-sm text-neutral-500 hover:text-neutral-900 hover:border-neutral-300 transition-colors"
      >
        {tc("logout")}
      </button>
    </form>
  );
}
