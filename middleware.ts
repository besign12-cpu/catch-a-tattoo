import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// 로그인 필요 경로
const PROTECTED_PATHS = [
  "/me",
  "/artists/new",
  // /artists/:handle/edit, /schedule/new, /schedule/:id, /portfolio
  // 동적 경로는 prefix 매칭으로 처리
];
// /artists/:handle 하위 관리 경로 (동적이므로 별도 처리)
const ARTIST_MANAGE_SUFFIXES = ["/edit", "/schedule/new", "/portfolio"];

// 로그인 상태에서 접근 불가 경로
const AUTH_PATHS = ["/auth/login", "/auth/signup"];

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

  // 세션 갱신 (반드시 getUser 호출)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // /artists/:handle/schedule/:id 도 보호 (동적 id 경로)
  const isArtistManagePath =
    pathname.startsWith("/artists/") &&
    (ARTIST_MANAGE_SUFFIXES.some((s) => pathname.includes(s)) ||
      /^\/artists\/[^/]+\/schedule\/[^/]+$/.test(pathname));

  // 보호 경로: 비로그인 → /auth/login 리다이렉트
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

  // 인증 경로: 로그인 상태 → 홈 리다이렉트
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
