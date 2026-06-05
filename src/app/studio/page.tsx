import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Settings } from "lucide-react";

import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getMyArtistProfile, getMyPortfolio } from "@/lib/queries/studio";
import { PageContainer } from "@/components/layout/PageContainer";
import { TopBar } from "@/components/layout/TopBar";
import { Avatar } from "@/components/ui/Avatar";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { TagList } from "@/components/ui/TagChip";

export const metadata: Metadata = {
  title: "스튜디오",
};

// ── 국가 코드 → 국가명 ───────────────────────────────────────
function countryName(code: string | null): string {
  if (!code) return "";
  const map: Record<string, string> = {
    KR: "South Korea",
    JP: "Japan",
    US: "United States",
    GB: "United Kingdom",
    FR: "France",
    DE: "Germany",
    AU: "Australia",
    TH: "Thailand",
    SG: "Singapore",
    HK: "Hong Kong",
    TW: "Taiwan",
    CN: "China",
    IT: "Italy",
    ES: "Spain",
    NL: "Netherlands",
    CA: "Canada",
    BR: "Brazil",
    MX: "Mexico",
  };
  return map[code] ?? code;
}

// ── 프로필 없을 때 ────────────────────────────────────────────

function NoProfileState() {
  return (
    <div className="flex flex-col items-center gap-5 px-6 py-16 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-neutral-100">
        <svg
          width="36"
          height="36"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-neutral-400"
          aria-hidden="true"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </div>
      <div className="flex flex-col gap-1.5">
        <h2 className="text-[15px] font-semibold text-neutral-900">
          아티스트 프로필이 없습니다
        </h2>
        <p className="text-sm text-neutral-400 leading-relaxed">
          게스트워크 일정을 등록하려면
          <br />
          아티스트 프로필을 먼저 만들어주세요.
        </p>
      </div>
      <Link
        href="/artists/new"
        className="
          inline-flex items-center justify-center
          w-full max-w-[280px] rounded-2xl
          bg-cat-black py-4
          text-sm font-semibold text-white
          hover:opacity-90 active:opacity-80
          transition-opacity
        "
      >
        아티스트 프로필 만들기
      </Link>
    </div>
  );
}

// ── 메인 페이지 ──────────────────────────────────────────────

export default async function StudioPage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/studio");
  }

  const profile = await getMyArtistProfile(user.id);

  // 포트폴리오 조회 (프로필 있을 때만)
  const portfolioItems = profile ? await getMyPortfolio(profile.id) : [];

  return (
    <PageContainer>
      <TopBar
        title="스튜디오"
        right={
          <Link
            href="/studio/profile/edit"
            className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100 transition-colors"
            aria-label="설정"
          >
            <Settings size={18} />
          </Link>
        }
      />

      {!profile ? (
        <NoProfileState />
      ) : (
        <div className="flex flex-col gap-4 px-4 pt-6 pb-10">
          {/* ── 프로필 헤더 카드 ────────────────────────────── */}
          <div className="rounded-2xl bg-white border border-neutral-100 px-5 py-5">
            <div className="flex items-center gap-4">
              <Avatar name={profile.displayName} size="lg" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h2 className="text-[15px] font-semibold text-neutral-900 leading-tight">
                    {profile.displayName}
                  </h2>
                  {profile.isVerified && <VerifiedBadge size={16} />}
                </div>
                {profile.instagramHandle && (
                  <p className="mt-0.5 text-xs text-neutral-400">
                    @{profile.instagramHandle}
                  </p>
                )}
                {profile.baseCity && (
                  <p className="mt-0.5 text-xs text-neutral-400">
                    {profile.baseCity}
                    {profile.baseCountry
                      ? `, ${countryName(profile.baseCountry)}`
                      : ""}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <span
                className={`
                  inline-flex items-center rounded-full px-2.5 py-1
                  text-[10px] font-medium
                  ${
                    profile.isClaimed
                      ? "bg-cat-green/10 text-cat-green"
                      : "bg-neutral-100 text-neutral-400"
                  }
                `}
              >
                {profile.isClaimed ? "✓ Claimed" : "Unclaimed"}
              </span>
              <span
                className={`
                  inline-flex items-center rounded-full px-2.5 py-1
                  text-[10px] font-medium
                  ${
                    profile.isVerified
                      ? "bg-blue-50 text-blue-600"
                      : "bg-neutral-100 text-neutral-400"
                  }
                `}
              >
                {profile.isVerified ? "✓ Verified" : "Pending Verification"}
              </span>
            </div>
          </div>

          {/* ── 스타일 태그 ─────────────────────────────────── */}
          {profile.tags.length > 0 && (
            <div className="rounded-2xl bg-white border border-neutral-100 px-5 py-4">
              <p className="mb-3 text-[11px] font-semibold tracking-widest text-neutral-400 uppercase">
                스타일 태그
              </p>
              <TagList tags={profile.tags} size="md" />
            </div>
          )}

          {/* ── 바이오 ──────────────────────────────────────── */}
          {profile.bio && (
            <div className="rounded-2xl bg-white border border-neutral-100 px-5 py-4">
              <p className="mb-2 text-[11px] font-semibold tracking-widest text-neutral-400 uppercase">
                소개
              </p>
              <p className="text-sm text-neutral-600 leading-relaxed">
                {profile.bio}
              </p>
            </div>
          )}

          {/* ── 포트폴리오 섹션 ─────────────────────────────── */}
          <div className="rounded-2xl bg-white border border-neutral-100 px-5 py-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[11px] font-semibold tracking-widest text-neutral-400 uppercase">
                포트폴리오
                {portfolioItems.length > 0 && (
                  <span className="ml-1 text-neutral-300">
                    ({portfolioItems.length})
                  </span>
                )}
              </p>
              <Link
                href="/studio/portfolio"
                className="text-[11px] text-cat-purple hover:underline"
              >
                관리
              </Link>
            </div>

            {portfolioItems.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-6 text-center">
                <p className="text-xs text-neutral-400">
                  등록된 포트폴리오 이미지가 없습니다.
                </p>
                <Link
                  href="/studio/portfolio"
                  className="text-xs text-cat-purple underline underline-offset-2"
                >
                  이미지 추가하기
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {portfolioItems.slice(0, 6).map((item) => (
                  <div key={item.id} className="aspect-square">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.imageUrl}
                      alt="포트폴리오 이미지"
                      className="h-full w-full rounded-xl object-cover bg-neutral-100"
                    />
                  </div>
                ))}
              </div>
            )}

            {portfolioItems.length > 6 && (
              <Link
                href="/studio/portfolio"
                className="mt-3 block text-center text-[11px] text-neutral-400 hover:text-neutral-600"
              >
                +{portfolioItems.length - 6}장 더 보기
              </Link>
            )}
          </div>

          {/* ── 액션 버튼 ───────────────────────────────────── */}
          <div className="flex flex-col gap-2 mt-1">
            {profile.instagramHandle && (
              <Link
                href={`/artists/${profile.instagramHandle}`}
                className="
                  flex items-center justify-center
                  w-full rounded-2xl bg-cat-black
                  py-4 text-sm font-semibold text-white
                  hover:opacity-90 active:opacity-80
                  transition-opacity
                "
              >
                내 프로필 보기
              </Link>
            )}
            <Link
              href="/studio/profile/edit"
              className="
                flex items-center justify-center
                w-full rounded-2xl border border-neutral-200 bg-white
                py-4 text-sm font-medium text-neutral-600
                hover:border-neutral-300 hover:text-neutral-900
                transition-colors
              "
            >
              프로필 수정
            </Link>
          </div>

          {/* ── 미인증 안내 ─────────────────────────────────── */}
          {!profile.isVerified && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
              <p className="text-xs font-medium text-amber-800">인증 대기 중</p>
              <p className="mt-0.5 text-[11px] text-amber-600 leading-relaxed">
                관리자 검토 후 Verified 뱃지가 부여됩니다.
              </p>
            </div>
          )}
        </div>
      )}
    </PageContainer>
  );
}
