import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// 로그인 필요 경로
const PROTECTED_PATHS = ["/me", "/artists/new"];
const ARTIST_MANAGE_SUFFIXES = ["/edit", "/schedule/new", "/portfolio"];

// 로그인 상태에서 접근 불가 경로
const AUTH_PATHS = ["/auth/login", "/auth/signup"];

/**
 * /ko prefix 처리:
 * - /ko/... 요청이 오면 pathname에서 /ko를 제거한 경로로 보호 경로 판단
 * - 실제 locale 라우팅은 쿠키 기반 (URL prefix 방식 미사용)
 * - Sprint 5-2: 구조 준비 단계, URL은 / 와 /ko 모두 같은 콘텐츠 렌더
 */
function stripLocalePrefix(pathname: string): string {
  if (pathname.startsWith("/ko/")) return pathname.slice(3);
  if (pathname === "/ko") return "/";
  return pathname;
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  // locale prefix를 제거한 경로로 보호 경로 판단
  const normalizedPath = stripLocalePrefix(pathname);

  const isArtistManagePath =
    normalizedPath.startsWith("/artists/") &&
    (ARTIST_MANAGE_SUFFIXES.some((s) => normalizedPath.includes(s)) ||
      /^\/artists\/[^/]+\/schedule\/[^/]+$/.test(normalizedPath));

  const isProtected =
    isArtistManagePath ||
    PROTECTED_PATHS.some(
      (p) => normalizedPath === p || normalizedPath.startsWith(p + "/")
    );

  if (isProtected && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/auth/login";
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  const isAuthPath = AUTH_PATHS.some((p) => normalizedPath === p);
  if (isAuthPath && user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/";
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
