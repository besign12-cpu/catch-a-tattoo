"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { useT } from "@/lib/hooks/useT";

export function SettingsBackButton() {
  const pathname = usePathname();
  const tc       = useT("common");
  // /ko/me/settings → /ko/me
  // /me/settings    → /me
  const backHref = pathname.startsWith("/ko") ? "/ko/me" : "/me";

  return (
    <Link
      href={backHref}
      className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-700 active:bg-neutral-100"
      aria-label={tc("back")}
    >
      <ChevronLeft size={20} />
    </Link>
  );
}
