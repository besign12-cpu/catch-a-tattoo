/**
 * useLocale
 *
 * Client Component에서 현재 locale을 읽는 훅.
 * NEXT_LOCALE 쿠키 → localStorage → "en" 순으로 결정.
 */
"use client";

import { useMemo } from "react";
import type { Locale } from "@/i18n/config";

export function useLocale(): Locale {
  return useMemo<Locale>(() => {
    if (typeof document === "undefined") return "en";
    const match = document.cookie.match(/NEXT_LOCALE=([^;]+)/);
    const val   = match?.[1];
    if (val === "ko" || val === "en") return val;
    if (typeof localStorage !== "undefined") {
      const ls = localStorage.getItem("CAT_LOCALE");
      if (ls === "ko" || ls === "en") return ls;
    }
    return "en";
  }, []);
}
