import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, Share2, MapPin, Plus, Settings, Image as ImageIcon } from "lucide-react";
import { Suspense } from "react";

import { PageContainer } from "@/components/layout/PageContainer";
import { Avatar } from "@/components/ui/Avatar";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { TagList } from "@/components/ui/TagChip";
import { ProfileSkeleton } from "@/components/ui/Skeleton";
import { ScheduleBlock } from "@/components/schedule/ScheduleBlock";

import { getArtistProfile } from "@/lib/queries/artists";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getMyPortfolio } from "@/lib/queries/studio";
import { getArtistByHandle } from "@/data/dummy";
import { isScheduleActive } from "@/lib/utils";
import { getBringStatus } from "@/actions/bring";
import { getFollowStatus } from "@/actions/follow";
import { BringButton } from "@/components/artist/BringButton";
import { FollowButton } from "@/components/artist/FollowButton";
import type { GuestSchedule } from "@/types";

interface Props {
  params: Promise<{ handle: string }>;
  searchParams: Promise<{ tab?: string }>;
}

// ── Metadata ─────────────────────────────────────────────────

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const artist =
    (await getArtistProfile(handle).catch(() => null)) ??
    getArtistByHandle(handle) ??
    null;
  if (!artist) return { title: "아티스트를 찾을 수 없습니다" };
  return {
    title: artist.displayName,
    description: artist.bio ?? `${artist.displayName}의 게스트워크 일정`,
  };
}

// ── Instagram SVG 아이콘 ──────────────────────────────────────

function InstagramIcon({ size = 15 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r=".5" fill="currentColor" />
    </svg>
  );
}

// ── 포트폴리오 Placeholder ────────────────────────────────────

function PortfolioPlaceholder() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-neutral-300"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );
}

// ── 예약 가능 여부 계산 헬퍼 ──────────────────────────────────

function getAvailStatus(
  schedule: GuestSchedule
): "available" | "fully_booked" | null {
  const status = isScheduleActive(schedule.startDate, schedule.endDate);
  if (status === "ended") return null;
  const fullyBooked =
    schedule.note?.toLowerCase().includes("마감") ||
    schedule.note?.toLowerCase().includes("full") ||
    schedule.note?.toLowerCase().includes("booked") ||
    false;
  return fullyBooked ? "fully_booked" : "available";
}

// ── 탭 네비게이션 (본인용) ────────────────────────────────────

function OwnerTabNav({
  handle,
  activeTab,
}: {
  handle: string;
  activeTab: "profile" | "schedule" | "insights";
}) {
  const tabs = [
    { key: "profile", label: "프로필" },
    { key: "schedule", label: "일정" },
    { key: "insights", label: "인사이트" },
  ] as const;

  return (
    <div className="flex border-b border-neutral-100 bg-white">
      {tabs.map((tab) => (
        <Link
          key={tab.key}
          href={
            tab.key === "profile"
              ? `/artists/${handle}`
              : `/artists/${handle}?tab=${tab.key}`
          }
          className={[
            "flex-1 py-3 text-center text-[13px] font-medium transition-colors",
            activeTab === tab.key
              ? "border-b-2 border-neutral-900 text-neutral-900"
              : "text-neutral-400",
          ].join(" ")}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}

// ── 일정 탭 (본인용) ─────────────────────────────────────────

function OwnerScheduleTab({
  handle,
  schedules,
}: {
  handle: string;
  schedules: GuestSchedule[];
}) {
  return (
    <div className="pb-10">
      {/* 등록 CTA */}
      <div className="px-4 pt-4 pb-2">
        <Link
          href={`/artists/${handle}/schedule/new`}
          className="flex items-center justify-center gap-2 w-full rounded-2xl bg-neutral-900 py-3.5 text-sm font-semibold text-white hover:opacity-90 active:opacity-80 transition-opacity"
        >
          <Plus size={15} aria-hidden="true" />
          Guest Work 등록
        </Link>
      </div>

      {/* 일정 목록 */}
      <section className="mt-2 bg-white px-4 py-4">
        <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-neutral-400">
          등록된 일정
          {schedules.length > 0 && (
            <span className="ml-1.5 text-neutral-300">{schedules.length}</span>
          )}
        </h3>

        {schedules.length > 0 ? (
          <div className="flex flex-col gap-3">
            {schedules.map((schedule) => (
              <div key={schedule.id} className="flex flex-col gap-1">
                <ScheduleBlock
                  schedule={schedule}
                  variant="card"
                  availStatus={getAvailStatus(schedule)}
                />
                <div className="flex justify-end px-1">
                  <Link
                    href={`/artists/${handle}/schedule/${schedule.id}`}
                    className="text-[11px] font-medium text-neutral-400 hover:text-neutral-600 transition-colors"
                    aria-label={`${schedule.city} 일정 수정`}
                  >
                    수정 →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 rounded-2xl bg-neutral-50 py-8 text-center">
            <MapPin size={20} className="text-neutral-300" aria-hidden="true" />
            <p className="text-sm text-neutral-400">
              등록된 게스트워크 일정이 없습니다
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

// ── 인사이트 탭 (본인용, Sprint 6 예정) ─────────────────────

function OwnerInsightsTab({ handle }: { handle: string }) {
  return (
    <div className="flex flex-col items-center gap-4 px-4 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-neutral-100">
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-neutral-400"
          aria-hidden="true"
        >
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      </div>
      <div className="flex flex-col gap-1.5">
        <p className="text-[15px] font-semibold text-neutral-900">
          인사이트 준비 중
        </p>
        <p className="text-sm text-neutral-400 leading-relaxed">
          도시별 Bring 수, Profile View 등<br />
          아티스트 인사이트는 Sprint 6에서 제공됩니다.
        </p>
      </div>
      <Link
        href={`/artists/${handle}`}
        className="text-[13px] text-neutral-400 underline underline-offset-2"
      >
        프로필로 돌아가기
      </Link>
    </div>
  );
}

// ── 프로필 콘텐츠 ────────────────────────────────────────────

async function ProfileContent({
  handle,
  ownerArtistId,
  activeTab,
  isLoggedIn,
}: {
  handle: string;
  ownerArtistId: string | null;
  activeTab: "profile" | "schedule" | "insights";
  isLoggedIn: boolean;
}) {
  const artist =
    (await getArtistProfile(handle).catch(() => null)) ??
    getArtistByHandle(handle) ??
    null;

  if (!artist) notFound();

  const isOwner = ownerArtistId === artist.id;
  const instagramUrl = `https://www.instagram.com/${artist.instagramHandle.replace("@", "")}`;

  // Bring 상태 조회 (My City 기준)
  const bringInfo = await getBringStatus(artist.id);
  const { isBringing, myCityBringCount, baseCity } = bringInfo;

  // Follow 상태 조회
  const { isFollowing, followerCount } = await getFollowStatus(artist.id);

  // 포트폴리오 (본인 탭에서도 사용)
  let portfolioItems = artist.portfolioItems;
  if (isOwner && ownerArtistId) {
    try {
      portfolioItems = await getMyPortfolio(ownerArtistId);
    } catch {
      // fallback to artist.portfolioItems
    }
  }

  const sortedSchedules = [...artist.upcomingSchedules].sort((a, b) => {
    const aStatus = isScheduleActive(a.startDate, a.endDate);
    const bStatus = isScheduleActive(b.startDate, b.endDate);
    if (aStatus === "active" && bStatus !== "active") return -1;
    if (aStatus !== "active" && bStatus === "active") return 1;
    return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
  });

  return (
    <div className="pb-10">
      {/* ── 탭 네비게이션 (본인만) ─────────────────────────── */}
      {isOwner && (
        <OwnerTabNav handle={handle} activeTab={activeTab} />
      )}

      {/* ── 본인 일정 탭 ───────────────────────────────────── */}
      {isOwner && activeTab === "schedule" && (
        <OwnerScheduleTab handle={handle} schedules={sortedSchedules} />
      )}

      {/* ── 본인 인사이트 탭 ────────────────────────────────── */}
      {isOwner && activeTab === "insights" && (
        <OwnerInsightsTab handle={handle} />
      )}

      {/* ── 프로필 탭 (기본) ────────────────────────────────── */}
      {(!isOwner || activeTab === "profile") && (
        <>
          {/* 프로필 헤더 */}
          <section className="bg-white px-4 pb-4 pt-4">
            <div className="mb-3 flex items-start gap-3">
              <Avatar name={artist.displayName} size="lg" />
              <div className="min-w-0 flex-1">
                <div className="mb-0.5 flex items-center gap-1.5 flex-wrap">
                  <h2 className="text-[17px] font-semibold leading-tight text-neutral-900">
                    {artist.displayName}
                  </h2>
                  {artist.isVerified && <VerifiedBadge size={16} />}
                </div>
                <p className="text-xs text-neutral-400">
                  Based in {artist.baseCity}
                  {artist.baseCountry ? `, ${artist.baseCountry}` : ""}
                </p>
                {/* 팔로워 · My City Bring 항상 표시 */}
                {!isOwner && (
                  <p className="mt-0.5 mb-2 text-[12px] font-medium text-neutral-600">
                    팔로워 {followerCount}
                    <span className="mx-1.5 text-neutral-300">·</span>
                    My City Bring {myCityBringCount}
                  </p>
                )}
                {isOwner && <div className="mb-2" />}
                <TagList tags={artist.tags} size="sm" max={5} />
              </div>
            </div>

            {artist.bio && (
              <p className="mb-4 text-sm leading-relaxed text-neutral-500">
                {artist.bio}
              </p>
            )}

            {/* ── CTA 버튼 행 ──────────────────────────────── */}
            <div className="flex gap-2">
              {/* 본인이면 수정 버튼, 타인이면 팔로우 버튼 */}
              {isOwner ? (
                <Link
                  href={`/artists/${handle}/edit`}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-neutral-200 bg-white py-2.5 text-sm font-medium text-neutral-700 active:bg-neutral-50"
                >
                  <Settings size={14} aria-hidden="true" />
                  프로필 수정
                </Link>
              ) : (
                <FollowButton
                  artistId={artist.id}
                  artistHandle={artist.instagramHandle}
                  artistDisplayName={artist.displayName}
                  isFollowing={isFollowing}
                  isLoggedIn={isLoggedIn}
                  variant="profile"
                />
              )}

              {/* Bring 버튼 — 타인에게만 표시 */}
              {!isOwner && (
                <BringButton
                  artistId={artist.id}
                  artistHandle={artist.instagramHandle}
                  artistDisplayName={artist.displayName}
                  isBringing={isBringing}
                  baseCity={baseCity}
                  isLoggedIn={isLoggedIn}
                  isFollowing={isFollowing}
                />
              )}

              {/* Instagram 버튼 */}
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 rounded-xl border border-neutral-200 px-4 py-2.5 text-sm font-medium text-neutral-700 active:bg-neutral-50"
                aria-label={`${artist.displayName} Instagram`}
              >
                <InstagramIcon size={15} />
                <span>Instagram</span>
              </a>
            </div>

            {/* 본인: Guest Work 등록 CTA */}
            {isOwner && (
              <Link
                href={`/artists/${handle}/schedule/new`}
                className="mt-2 flex items-center justify-center gap-2 w-full rounded-xl bg-neutral-900 py-2.5 text-sm font-semibold text-white hover:opacity-90 active:opacity-80 transition-opacity"
              >
                <Plus size={14} aria-hidden="true" />
                Guest Work 등록
              </Link>
            )}
          </section>

          {/* ── Guest Work 일정 ──────────────────────────────── */}
          <section className="mt-2 bg-white px-4 py-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400">
                Guest Work
                {sortedSchedules.length > 0 && (
                  <span className="ml-1.5 text-neutral-300">
                    {sortedSchedules.length}
                  </span>
                )}
              </h3>
            </div>

            {sortedSchedules.length > 0 ? (
              <div className="flex flex-col gap-3">
                {sortedSchedules.map((schedule) => (
                  <div key={schedule.id} className="flex flex-col gap-1">
                    <ScheduleBlock
                      schedule={schedule}
                      variant="card"
                      availStatus={getAvailStatus(schedule)}
                    />
                    {/* 본인: 수정 링크 */}
                    {isOwner && (
                      <div className="flex justify-end px-1">
                        <Link
                          href={`/artists/${handle}/schedule/${schedule.id}`}
                          className="text-[11px] font-medium text-neutral-400 hover:text-neutral-600 transition-colors"
                          aria-label={`${schedule.city} 일정 수정`}
                        >
                          수정 →
                        </Link>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 rounded-2xl bg-neutral-50 py-8 text-center">
                <MapPin size={20} className="text-neutral-300" aria-hidden="true" />
                <p className="text-sm text-neutral-400">
                  등록된 게스트워크 일정이 없습니다
                </p>
                {isOwner && (
                  <Link
                    href={`/artists/${handle}/schedule/new`}
                    className="mt-1 text-[12px] font-medium text-neutral-600 underline underline-offset-2"
                  >
                    첫 Guest Work 등록하기
                  </Link>
                )}
              </div>
            )}
          </section>

          {/* ── 대표 작품 ─────────────────────────────────── */}
          <section className="mt-2 bg-white px-4 pb-4 pt-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400">
                대표 작품
              </h3>
              <div className="flex items-center gap-3">
                {/* 본인: 포트폴리오 관리 링크 */}
                {isOwner && (
                  <Link
                    href={`/artists/${handle}/portfolio`}
                    className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-neutral-600 transition-colors"
                    aria-label="포트폴리오 관리"
                  >
                    <ImageIcon size={11} aria-hidden="true" />
                    <span>관리</span>
                  </Link>
                )}
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-neutral-600 transition-colors"
                  aria-label="Instagram에서 더 보기"
                >
                  <InstagramIcon size={11} />
                  <span>더 보기</span>
                </a>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-0.5 overflow-hidden rounded-xl">
              {[0, 1, 2].map((i) => {
                const item = portfolioItems[i];
                return (
                  <div
                    key={i}
                    className="flex aspect-square items-center justify-center bg-neutral-100"
                  >
                    {item?.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.imageUrl}
                        alt={`${artist.displayName} 작품 ${i + 1}`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <PortfolioPlaceholder />
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* ── 미인증 클레임 배너 ────────────────────────── */}
          {!artist.isVerified && !isOwner && (
            <section className="mx-4 mb-2 mt-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
              <p className="mb-0.5 text-xs font-semibold text-amber-800">
                이 프로필은 나인가요?
              </p>
              <p className="mb-2.5 text-[11px] text-amber-600 leading-relaxed">
                Instagram DM 인증으로 본인 프로필임을 확인하세요.
              </p>
              <Link
                href={`/artists/${artist.instagramHandle}/claim`}
                className="inline-flex items-center rounded-xl bg-amber-700 px-4 py-2 text-xs font-semibold text-white active:opacity-80"
              >
                Verify Profile →
              </Link>
            </section>
          )}
        </>
      )}
    </div>
  );
}

// ── 메인 페이지 ─────────────────────────────────────────────

export default async function ArtistProfilePage({ params, searchParams }: Props) {
  const { handle } = await params;
  const { tab } = await searchParams;

  const activeTab: "profile" | "schedule" | "insights" =
    tab === "schedule" ? "schedule"
    : tab === "insights" ? "insights"
    : "profile";

  // 로그인 유저의 artist_id 조회
  let ownerArtistId: string | null = null;
  let isLoggedIn = false;
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      isLoggedIn = true;
      const { data: artistRow } = await supabase
        .from("artist_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
      ownerArtistId = artistRow?.id ?? null;
    }
  } catch {
    // 세션 조회 실패 → 비본인 처리
  }

  return (
    <PageContainer className="bg-neutral-50">
      {/* TopBar */}
      <header className="sticky top-0 z-40 flex h-[52px] items-center justify-between border-b border-neutral-100 bg-white px-4">
        <Link
          href="/"
          className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-700 active:bg-neutral-100"
          aria-label="뒤로가기"
        >
          <ArrowLeft size={20} />
        </Link>
        <span className="text-[13px] font-medium text-neutral-900">프로필</span>
        <button
          className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-700 active:bg-neutral-100"
          aria-label="공유"
        >
          <Share2 size={18} />
        </button>
      </header>

      <Suspense fallback={<ProfileSkeleton />}>
        <ProfileContent
          handle={handle}
          ownerArtistId={ownerArtistId}
          activeTab={activeTab}
          isLoggedIn={isLoggedIn}
        />
      </Suspense>
    </PageContainer>
  );
}
