import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_PATHS = ["/me", "/artists/new"];
const ARTIST_MANAGE_SUFFIXES = ["/edit", "/schedule/new", "/portfolio"];
const AUTH_PATHS = ["/auth/login", "/auth/signup"];

/** /ko/* 또는 /en/* prefix 제거 */
function stripLocale(pathname: string): string {
  if (pathname === "/ko") return "/";
  if (pathname.startsWith("/ko/")) return pathname.slice(3) || "/";
  if (pathname === "/en") return "/";
  if (pathname.startsWith("/en/")) return pathname.slice(3) || "/";
  return pathname;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── /ko/* → rewrite + 쿠키 설정 ─────────────────────────
  if (pathname === "/ko" || pathname.startsWith("/ko/")) {
    const target = stripLocale(pathname);
    const url    = request.nextUrl.clone();
    url.pathname = target;

    const res = NextResponse.rewrite(url);
    res.cookies.set("NEXT_LOCALE", "ko", {
      path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax",
    });
    return res;
  }

  // ── /en/* → rewrite + 쿠키 설정 ─────────────────────────
  if (pathname === "/en" || pathname.startsWith("/en/")) {
    const target = stripLocale(pathname);
    const url    = request.nextUrl.clone();
    url.pathname = target;

    const res = NextResponse.rewrite(url);
    res.cookies.set("NEXT_LOCALE", "en", {
      path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax",
    });
    return res;
  }

  // ── Supabase 인증 ─────────────────────────────────────────
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
