import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard } from "lucide-react";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getUserProfile } from "@/lib/queries/user";
import { PageContainer } from "@/components/layout/PageContainer";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/utils";
import {
  SettingsLink,
  SettingsIconLink,
  LogoutButton,
} from "@/components/me/MeLinks";

const COUNTRY_NAMES: Record<string, string> = {
  KR: "South Korea", JP: "Japan", US: "United States",
  GB: "United Kingdom", FR: "France", DE: "Germany",
  AU: "Australia", TH: "Thailand", SG: "Singapore",
  HK: "Hong Kong", TW: "Taiwan", CN: "China",
  IT: "Italy", ES: "Spain", NL: "Netherlands",
  CA: "Canada", BR: "Brazil", MX: "Mexico",
};
function countryName(code: string | null): string {
  if (!code) return "";
  return COUNTRY_NAMES[code] ?? code;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-5 py-3 border-t border-neutral-50 first:border-t-0">
      <span className="text-xs text-neutral-400">{label}</span>
      <span className="text-sm text-neutral-700 font-medium text-right max-w-[60%] truncate">
        {value}
      </span>
    </div>
  );
}

export default async function MePage() {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  let profile = null;
  try { profile = await getUserProfile(user.id); } catch { /* silent */ }

  const displayName = profile?.username ?? user.email?.split("@")[0] ?? "User";
  const email       = profile?.email ?? user.email ?? "";

  const joinDate = profile
    ? (() => {
        const d = new Date(profile.createdAt);
        return `${d.getFullYear()}년 ${d.getMonth() + 1}월 가입`;
      })()
    : "";

  return (
    <PageContainer>
      <div className="sticky top-0 z-40 flex h-[52px] items-center justify-between border-b border-neutral-100 bg-white px-4">
        <h1 className="text-[15px] font-semibold text-neutral-900">My Info</h1>
        {/* locale-aware: /ko/me → /ko/me/settings */}
        <SettingsIconLink />
      </div>

      <div className="flex flex-col pb-8">
        <section className="flex flex-col items-center gap-3 px-4 pt-8 pb-6">
          <Avatar name={displayName} size="lg" />
          <div className="text-center">
            <h2 className="text-[15px] font-semibold text-neutral-900">{displayName}</h2>
            <p className="mt-0.5 text-xs text-neutral-400">{email}</p>
          </div>
          {profile && (
            <div className="flex items-center gap-2">
              <span className={cn(
                "rounded-full px-2.5 py-0.5 text-[10px] font-medium",
                profile.role === "artist"  ? "bg-cat-purple/10 text-cat-purple"
                : profile.role === "admin" ? "bg-red-50 text-red-600"
                : "bg-neutral-100 text-neutral-500"
              )}>
                {profile.role === "artist" ? "Artist" : profile.role === "admin" ? "Admin" : "Member"}
              </span>
              {joinDate && (
                <span className="text-[10px] text-neutral-300">{joinDate}</span>
              )}
            </div>
          )}
        </section>

        <div className="px-4 flex flex-col gap-3">
          {(profile?.role === "artist" || profile?.role === "admin") && profile?.artistHandle && (
            <Link
              href={`/artists/${profile.artistHandle}`}
              className="flex items-center justify-between rounded-2xl bg-neutral-900 px-5 py-4 hover:opacity-90 active:opacity-80 transition-opacity"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
                  <LayoutDashboard size={16} className="text-white" aria-hidden="true" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <p className="text-[13px] font-semibold text-white leading-tight">
                    @{profile.artistHandle} Profile
                  </p>
                  <p className="text-[11px] text-neutral-400 leading-tight">
                    Guest Work · Edit Profile
                  </p>
                </div>
              </div>
              <span className="text-xs text-neutral-400">→</span>
            </Link>
          )}

          <div className="rounded-2xl bg-white border border-neutral-100 overflow-hidden">
            <InfoRow label="Email" value={email} />
            {profile?.username && (
              <InfoRow label="Username" value={`@${profile.username}`} />
            )}
            {profile?.baseCity && (
              <InfoRow
                label="Based City"
                value={`${profile.baseCity}${profile.baseCountry ? `, ${countryName(profile.baseCountry)}` : ""}`}
              />
            )}
          </div>

          {/* locale-aware: /ko/me → /ko/me/settings */}
          <SettingsLink />

          {/* locale-aware: 로그아웃 후 /ko/ 또는 / */}
          <LogoutButton />
        </div>
      </div>
    </PageContainer>
  );
}
