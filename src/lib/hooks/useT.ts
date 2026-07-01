"use client";

/**
 * useT — Client Component용 번역 훅
 *
 * usePathname() 기반으로 locale 결정.
 * - /ko/* → "ko"
 * - 그 외 → "en"
 *
 * SSR 시점에도 pathname이 정확하므로 hydration 불일치 없음.
 * (기존 getClientLocale()는 SSR에서 항상 "en"을 반환해 번역이 안 됐음)
 */

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { buildT, type TFunction } from "@/i18n/translations";
import type { Locale } from "@/i18n/config";

type Namespace = Parameters<typeof buildT>[1];

function localeFromPath(pathname: string): Locale {
  return pathname === "/ko" || pathname.startsWith("/ko/") ? "ko" : "en";
}

export function useT(namespace: Namespace): TFunction {
  const pathname = usePathname();
  const locale   = localeFromPath(pathname);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => buildT(locale, namespace), [locale, namespace]);
}
