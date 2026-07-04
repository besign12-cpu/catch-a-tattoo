import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_PATHS = ["/me", "/artists/new"];
const ARTIST_MANAGE_SUFFIXES = ["/edit", "/schedule/new", "/portfolio"];
const AUTH_PATHS = ["/auth/login", "/auth/signup"];

function isKoPath(pathname: string): boolean {
  return pathname === "/ko" || pathname.startsWith("/ko/");
}
function stripKo(pathname: string): string {
  if (pathname === "/ko") return "/";
  if (pathname.startsWith("/ko/")) return pathname.slice(3) || "/";
  return pathname;
}

/**
 * /ko/* 경로에서 서버 컴포넌트가 NEXT_LOCALE=ko를 읽을 수 있도록
 * request.headers에도 쿠키를 포함시켜 NextResponse.next()에 전달
 */
function makeKoResponse(request: NextRequest): NextResponse {
  const requestHeaders = new Headers(request.headers);
  // Cookie 헤더에 NEXT_LOCALE=ko 추가 (기존 쿠키 유지)
  const existingCookies = request.headers.get("cookie") ?? "";
  const hasNextLocale   = existingCookies.includes("NEXT_LOCALE=");
  const newCookies = hasNextLocale
    ? existingCookies.replace(/NEXT_LOCALE=[^;]*(;|$)/, "NEXT_LOCALE=ko$1")
    : existingCookies
      ? `${existingCookies}; NEXT_LOCALE=ko`
      : "NEXT_LOCALE=ko";
  requestHeaders.set("cookie", newCookies);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  // 브라우저에도 Set-Cookie로 쿠키 영속화
  response.cookies.set("NEXT_LOCALE", "ko", {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── /ko/* 경로 ────────────────────────────────────────────
  if (isKoPath(pathname)) {
    const realPath = stripKo(pathname);

    // 보호 경로 처리 (인증 확인)
    const isArtistManagePath =
      realPath.startsWith("/artists/") &&
      (ARTIST_MANAGE_SUFFIXES.some((s) => realPath.includes(s)) ||
        /^\/artists\/[^/]+\/schedule\/[^/]+$/.test(realPath));
    const isProtected =
      isArtistManagePath ||
      PROTECTED_PATHS.some((p) => realPath === p || realPath.startsWith(p + "/"));

    if (isProtected) {
      // 인증 확인
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() { return request.cookies.getAll(); },
            setAll() {},
          },
        }
      );
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = "/auth/login";
        redirectUrl.searchParams.set("next", pathname);
        // redirect 응답에도 쿠키 설정 (로그인 후 복귀 시 locale 유지)
        const res = NextResponse.redirect(redirectUrl);
        res.cookies.set("NEXT_LOCALE", "ko", {
          path: "/",
          maxAge: 60 * 60 * 24 * 365,
          sameSite: "lax",
        });
        return res;
      }
    }

    // request.headers + response.cookies 모두에 NEXT_LOCALE=ko 설정
    return makeKoResponse(request);
  }

  // ── /en/* → redirect ──────────────────────────────────────
  if (pathname === "/en" || pathname.startsWith("/en/")) {
    const target = pathname === "/en" ? "/" : pathname.slice(3) || "/";
    const url    = request.nextUrl.clone();
    url.pathname = target;
    const res    = NextResponse.redirect(url);
    res.cookies.set("NEXT_LOCALE", "en", {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
    return res;
  }

  // ── 일반 경로 ─────────────────────────────────────────────
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
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

  const { data: { user } } = await supabase.auth.getUser();

  const isArtistManagePath =
    pathname.startsWith("/artists/") &&
    (ARTIST_MANAGE_SUFFIXES.some((s) => pathname.includes(s)) ||
      /^\/artists\/[^/]+\/schedule\/[^/]+$/.test(pathname));
  const isProtected =
    isArtistManagePath ||
    PROTECTED_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  const isAuthPath = AUTH_PATHS.some((p) => pathname === p);
  if (isAuthPath && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search   = "";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
