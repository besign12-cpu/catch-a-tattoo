"use client";

/**
 * useLocaleNav — locale-aware 네비게이션 훅
 *
 * 현재 pathname 기준으로 locale 판단 후
 * 모든 내부 이동에 자동으로 /ko prefix 적용.
 *
 * 사용:
 *   const { lp, href, push } = useLocaleNav();
 *   href("/me/settings")   → /ko/me/settings (KO) or /me/settings (EN)
 *   push("/me/settings")   → router.push with locale prefix
 */

import { usePathname, useRouter } from "next/navigation";

function isKo(pathname: string): boolean {
  return pathname === "/ko" || pathname.startsWith("/ko/");
}

export function useLocaleNav() {
  const pathname = usePathname();
  const router   = useRouter();
  const ko       = isKo(pathname);

  /** locale prefix: "/ko" | "" */
  const lp = ko ? "/ko" : "";

  /** 경로에 locale prefix 붙이기 */
  function href(path: string): string {
    if (!ko) return path;
    if (path === "/") return "/ko";
    return `/ko${path}`;
  }

  /** router.push with locale */
  function push(path: string): void {
    router.push(href(path));
  }

  /** router.replace with locale */
  function replace(path: string): void {
    router.replace(href(path));
  }

  return { lp, href, push, replace, isKo: ko };
}
