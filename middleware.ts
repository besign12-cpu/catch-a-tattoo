import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_PATHS = ["/me", "/artists/new"];
const ARTIST_MANAGE_SUFFIXES = ["/edit", "/schedule/new", "/portfolio"];
const AUTH_PATHS = ["/auth/login", "/auth/signup"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── /ko URL prefix 처리 ──────────────────────────────────
  // rewrite: URL은 /ko/xxx 유지, 내부적으로 /xxx 렌더 → 404 없음
  // + NEXT_LOCALE=ko 쿠키 설정
  if (pathname === "/ko" || pathname.startsWith("/ko/")) {
    const rewritePath =
      pathname === "/ko" ? "/" : pathname.slice(3) || "/";

    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = rewritePath;

    const response = NextResponse.rewrite(rewriteUrl);
    response.cookies.set("NEXT_LOCALE", "ko", {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
    return response;
  }

  // ── /en URL prefix 처리 ──────────────────────────────────
  if (pathname === "/en" || pathname.startsWith("/en/")) {
    const rewritePath =
      pathname === "/en" ? "/" : pathname.slice(3) || "/";

    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = rewritePath;

    const response = NextResponse.rewrite(rewriteUrl);
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
    PROTECTED_PATHS.some(
      (p) => pathname === p || pathname.startsWith(p + "/")
    );

  if (isProtected && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/auth/login";
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  const isAuthPath = AUTH_PATHS.some((p) => pathname === p);
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
