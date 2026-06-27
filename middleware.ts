import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_PATHS = ["/me", "/artists/new"];
const ARTIST_MANAGE_SUFFIXES = ["/edit", "/schedule/new", "/portfolio"];
const AUTH_PATHS = ["/auth/login", "/auth/signup"];

/** pathname이 /ko/* 경로인지 */
function isKoPath(pathname: string): boolean {
  return pathname === "/ko" || pathname.startsWith("/ko/");
}

/** /ko/* 경로에서 locale prefix 제거 → 실제 경로 */
function stripKo(pathname: string): string {
  if (pathname === "/ko") return "/";
  if (pathname.startsWith("/ko/")) return pathname.slice(3) || "/";
  return pathname;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── /ko/* 경로: 실제 라우트가 존재하므로 그냥 통과
  // 단, NEXT_LOCALE=ko 쿠키를 응답에 심어서 서버 컴포넌트가 한국어를 렌더하게 함
  if (isKoPath(pathname)) {
    // Supabase 인증도 처리해야 하므로 아래서 함께 처리
    let response = NextResponse.next({ request });
    response.cookies.set("NEXT_LOCALE", "ko", {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });

    // 보호 경로 처리: /ko/me, /ko/artists/new 등
    const realPath = stripKo(pathname);
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
            response = NextResponse.next({ request });
            response.cookies.set("NEXT_LOCALE", "ko", {
              path: "/",
              maxAge: 60 * 60 * 24 * 365,
              sameSite: "lax",
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();

    const isArtistManagePath =
      realPath.startsWith("/artists/") &&
      (ARTIST_MANAGE_SUFFIXES.some((s) => realPath.includes(s)) ||
        /^\/artists\/[^/]+\/schedule\/[^/]+$/.test(realPath));

    const isProtected =
      isArtistManagePath ||
      PROTECTED_PATHS.some((p) => realPath === p || realPath.startsWith(p + "/"));

    if (isProtected && !user) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/auth/login";
      redirectUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(redirectUrl);
    }

    return response;
  }

  // ── /en/* → / 로 redirect + NEXT_LOCALE=en 쿠키
  if (pathname === "/en" || pathname.startsWith("/en/")) {
    const target = pathname === "/en" ? "/" : pathname.slice(3) || "/";
    const url = request.nextUrl.clone();
    url.pathname = target;
    const res = NextResponse.redirect(url);
    res.cookies.set("NEXT_LOCALE", "en", {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
    return res;
  }

  // ── 일반 경로: NEXT_LOCALE=en 쿠키가 없으면 기본값 유지
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
    url.search = "";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
