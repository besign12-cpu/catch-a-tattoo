import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import { Settings, LayoutDashboard } from "lucide-react";

import { getT } from "@/i18n/translations.server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getUserProfile } from "@/lib/queries/user";
import { PageContainer } from "@/components/layout/PageContainer";
import { TopBar } from "@/components/layout/TopBar";
import { Avatar } from "@/components/ui/Avatar";
import { signOut } from "@/actions/auth";
import { cn } from "@/lib/utils";

// 국가 코드 → 국가명 변환
function countryName(code: string | null): string {
  if (!code) return "";
  const map: Record<string, string> = {
    KR: "South Korea", JP: "Japan", US: "United States",
    GB: "United Kingdom", FR: "France", DE: "Germany",
    AU: "Australia", TH: "Thailand", SG: "Singapore",
    HK: "Hong Kong", TW: "Taiwan", CN: "China",
    IT: "Italy", ES: "Spain", NL: "Netherlands",
    CA: "Canada", BR: "Brazil", MX: "Mexico",
  };
  return map[code] ?? code;
}


export default async function MePage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 비로그인 - 현재 경로를 next로 전달해 로그인 후 복귀
  if (!user) {
    // headers에서 현재 요청 pathname 읽기 (x-invoke-path 또는 next-url)
    const { headers } = await import("next/headers");
    const headerStore = await headers();
    const nextUrl = headerStore.get("x-invoke-path") ?? headerStore.get("x-url") ?? "/me";
    redirect(`/auth/login?next=${encodeURIComponent(nextUrl)}`);
  }

  const t  = await getT("me");
  const tc = await getT("common");
  const cookieStore = await cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value === "ko" ? "ko" : "en";
  const lp = locale === "ko" ? "/ko" : "";  // localePrefix

  let profile = null;
  try {
    profile = await getUserProfile(user.id);
  } catch {
    // DB 일시 에러 — user 인증 완료됐으므로 계속 렌더
  }

  const displayName = profile?.username ?? user.email?.split("@")[0] ?? "User";
  const email = profile?.email ?? user.email ?? "";

  const roleMap: Record<string, string> = {
    customer: t("role.customer"),
    artist:   t("role.artist"),
    admin:    t("role.admin"),
  };
  const roleName = roleMap[profile?.role ?? "customer"] ?? t("role.customer");

  const joinDate = profile
    ? (() => {
        const d = new Date(profile.createdAt);
        return t("joinDate", { year: d.getFullYear(), month: d.getMonth() + 1 });
      })()
    : "";

  return (
    <PageContainer>
      <TopBar
        title={t("myInfo")}
        right={
          <Link
            href={`${lp}/me/settings`}
            className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100 transition-colors"
            aria-label={tc("settings")}
          >
            <Settings size={18} />
          </Link>
        }
      />

      <div className="flex flex-col pb-8">
        {/* 프로필 헤더 */}
        <section className="flex flex-col items-center gap-3 px-4 pt-8 pb-6">
          <Avatar name={displayName} size="lg" />
          <div className="text-center">
            <h2 className="text-[15px] font-semibold text-neutral-900">{displayName}</h2>
            <p className="mt-0.5 text-xs text-neutral-400">{email}</p>
          </div>
          <div className="flex items-center gap-2">
            {profile && (
              <span className={cn(
                "rounded-full px-2.5 py-0.5 text-[10px] font-medium",
                profile.role === "artist"
                  ? "bg-cat-purple/10 text-cat-purple"
                  : profile.role === "admin"
                  ? "bg-red-50 text-red-600"
                  : "bg-neutral-100 text-neutral-500"
              )}>
                {roleName}
              </span>
            )}
            {profile && (
              <span className="text-[10px] text-neutral-300">{joinDate}</span>
            )}
          </div>
        </section>

        <div className="px-4 flex flex-col gap-3">
          {/* 아티스트 프로필 CTA */}
          {(profile?.role === "artist" || profile?.role === "admin") && profile?.artistHandle && (
            <Link
              href={`${lp}/artists/${profile.artistHandle}`}
              className="flex items-center justify-between rounded-2xl bg-neutral-900 px-5 py-4 hover:opacity-90 active:opacity-80 transition-opacity"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
                  <LayoutDashboard size={16} className="text-white" aria-hidden="true" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <p className="text-[13px] font-semibold text-white leading-tight">
                    {t("myArtistProfile", { handle: profile.artistHandle })}
                  </p>
                  <p className="text-[11px] text-neutral-400 leading-tight">
                    {t("artistProfileDesc")}
                  </p>
                </div>
              </div>
              <span className="text-xs text-neutral-400">→</span>
            </Link>
          )}

          {/* 기본 정보 */}
          <div className="rounded-2xl bg-white border border-neutral-100 overflow-hidden">
            <p className="px-5 pt-4 pb-2 text-[11px] font-medium text-neutral-400 tracking-wide uppercase">
              {t("email")}
            </p>
            <InfoRow label={t("email")} value={email} />
            {profile?.username && (
              <InfoRow label={t("username")} value={`@${profile.username}`} />
            )}
            {profile?.baseCity && (
              <InfoRow
                label="Based City"
                value={`${profile.baseCity}${profile.baseCountry ? `, ${countryName(profile.baseCountry)}` : ""}`}
              />
            )}
          </div>

          {/* 설정 바로가기 */}
          <Link
            href={`${lp}/me/settings`}
            className="flex items-center justify-between rounded-2xl bg-white border border-neutral-100 px-5 py-4 hover:border-neutral-200 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Settings size={16} className="text-neutral-400" aria-hidden="true" />
              <span className="text-sm font-medium text-neutral-700">{tc("settings")}</span>
            </div>
            <span className="text-xs text-neutral-300">Base City · →</span>
          </Link>

          {/* 로그아웃 */}
          <form action={signOut} className="mt-1">
            <button
              type="submit"
              className="w-full rounded-2xl border border-neutral-200 bg-white py-4 text-sm text-neutral-500 hover:text-neutral-900 hover:border-neutral-300 transition-colors"
            >
              {tc("logout")}
            </button>
          </form>
        </div>
      </div>
    </PageContainer>
  );
}

// InfoRow 서브 컴포넌트
interface InfoRowProps { label: string; value: string; }

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div className="flex items-center justify-between px-5 py-3 border-t border-neutral-50 first:border-t-0">
      <span className="text-xs text-neutral-400">{label}</span>
      <span className="text-sm text-neutral-700 font-medium text-right max-w-[60%] truncate">
        {value}
      </span>
    </div>
  );
}
