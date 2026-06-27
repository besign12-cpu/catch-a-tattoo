import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// 로그인 필요 경로
const PROTECTED_PATHS = ["/me", "/artists/new"];
const ARTIST_MANAGE_SUFFIXES = ["/edit", "/schedule/new", "/portfolio"];

// 로그인 상태에서 접근 불가 경로
const AUTH_PATHS = ["/auth/login", "/auth/signup"];

// locale prefix 제거
function stripLocalePrefix(pathname: string): string {
  if (pathname.startsWith("/ko/")) return pathname.slice(3);
  if (pathname === "/ko") return "/";
  return pathname;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── /ko URL prefix 처리 ──────────────────────────────────
  // /ko 또는 /ko/* 요청: NEXT_LOCALE=ko 쿠키 설정 후 / 또는 /* 로 리다이렉트
  if (pathname === "/ko" || pathname.startsWith("/ko/")) {
    const redirectPath = stripLocalePrefix(pathname) || "/";
    const redirectUrl  = request.nextUrl.clone();
    redirectUrl.pathname = redirectPath;

    const response = NextResponse.redirect(redirectUrl);
    response.cookies.set("NEXT_LOCALE", "ko", {
      path: "/",
      maxAge: 60 * 60 * 24 * 365, // 1년
      sameSite: "lax",
    });
    return response;
  }

  // ── /en URL prefix 처리 ──────────────────────────────────
  // /en 또는 /en/* 요청: NEXT_LOCALE=en 쿠키 설정 후 / 또는 /* 로 리다이렉트
  if (pathname === "/en" || pathname.startsWith("/en/")) {
    const redirectPath = pathname === "/en" ? "/" : pathname.slice(3);
    const redirectUrl  = request.nextUrl.clone();
    redirectUrl.pathname = redirectPath;

    const response = NextResponse.redirect(redirectUrl);
    response.cookies.set("NEXT_LOCALE", "en", {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
    return response;
  }

  // ── Supabase 인증 처리 ────────────────────────────────────
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

  const normalizedPath = pathname;

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
