import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, Share2, MapPin, Users } from "lucide-react";
import { Suspense } from "react";

import { PageContainer } from "@/components/layout/PageContainer";
import { Avatar } from "@/components/ui/Avatar";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { TagList } from "@/components/ui/TagChip";
import { ScheduleBlock } from "@/components/schedule/ScheduleBlock";
import { ProfileSkeleton } from "@/components/ui/Skeleton";

import { getArtistProfile } from "@/lib/queries/artists";
import { getArtistByHandle } from "@/data/dummy";
import { formatDateRange, calcDDay, isScheduleActive } from "@/lib/utils";
import type { GuestSchedule } from "@/types";

interface Props {
  params: Promise<{ handle: string }>;
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
// lucide-react 미지원 — SVG 직접 인라인

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

// ── 도시별 Bring 행 ───────────────────────────────────────────
// Sprint 5: city_follows (is_active=true) 실데이터로 교체 예정

function ScheduleBringRow({
  schedule,
  bringCount,
}: {
  schedule: GuestSchedule;
  bringCount: number;
}) {
  const status = isScheduleActive(schedule.startDate, schedule.endDate);
  const isActive = status === "active";
  const dday = calcDDay(schedule.startDate, schedule.endDate);
  const dateRange = formatDateRange(schedule.startDate, schedule.endDate);

  return (
    <div
      className={[
        "flex items-center gap-3 rounded-xl px-4 py-3",
        isActive
          ? "border border-emerald-100 bg-emerald-50"
          : "border border-neutral-100 bg-neutral-50",
      ].join(" ")}
    >
      {/* 도시 + 날짜 */}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-center gap-1.5">
          <MapPin
            size={11}
            className={isActive ? "text-emerald-500" : "text-neutral-400"}
            aria-hidden="true"
          />
          <span className="text-[13px] font-semibold text-neutral-900 leading-tight">
            {schedule.city}
          </span>
          {isActive && (
            <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-700">
              진행 중
            </span>
          )}
        </div>
        <span className="text-[11px] text-neutral-400 leading-tight">
          {dateRange} · {dday}
        </span>
      </div>

      {/* Bring 수 */}
      <div className="flex shrink-0 flex-col items-end gap-0.5">
        <div className="flex items-center gap-1">
          <Users size={10} className="text-neutral-400" aria-hidden="true" />
          <span className="text-[13px] font-bold text-neutral-900 leading-tight">
            {bringCount}
          </span>
        </div>
        <span className="text-[10px] text-neutral-400 leading-tight">Bring</span>
      </div>

      {/* Bring — Sprint 5에서 Client Component + useBring 훅으로 교체 예정 */}
      {/* Server Component에서 onClick 불가 → 비활성 UI */}
      <div
        className={[
          "shrink-0 rounded-xl px-3 py-2 text-[12px] font-semibold select-none cursor-default",
          bringCount > 0
            ? "bg-neutral-900 text-white"
            : "border border-neutral-200 bg-neutral-50 text-neutral-400",
        ].join(" ")}
        aria-label={`${schedule.city} Bring This Artist`}
        role="button"
        aria-disabled="true"
      >
        Bring
      </div>
    </div>
  );
}

// ── 프로필 콘텐츠 ────────────────────────────────────────────

async function ProfileContent({ handle }: { handle: string }) {
  const artist =
    (await getArtistProfile(handle).catch(() => null)) ??
    getArtistByHandle(handle) ??
    null;

  if (!artist) notFound();

  // Sprint 5: city_follows (is_active=true) WHERE artist_id = artist.id 쿼리로 교체
  // 현재: 도시별 Bring 수 0으로 초기화
  const bringCounts: Record<string, number> = {};
  artist.upcomingSchedules.forEach((s) => {
    bringCounts[s.id] = 0;
  });

  const isFollowing = false; // Sprint 5: useFollow 훅 연결 예정

  const instagramUrl = `https://www.instagram.com/${artist.instagramHandle.replace("@", "")}`;

  // 일정: 진행 중 → 예정 순 정렬 (이미 서버에서 정렬됐지만 명시적 보장)
  const sortedSchedules = [...artist.upcomingSchedules].sort((a, b) => {
    const aStatus = isScheduleActive(a.startDate, a.endDate);
    const bStatus = isScheduleActive(b.startDate, b.endDate);
    if (aStatus === "active" && bStatus !== "active") return -1;
    if (aStatus !== "active" && bStatus === "active") return 1;
    return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
  });

  return (
    <div className="pb-10">

      {/* ── 프로필 헤더 ─────────────────────────────────── */}
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
            <p className="mb-2 text-xs text-neutral-400">
              Based in {artist.baseCity}
              {artist.baseCountry ? `, ${artist.baseCountry}` : ""}
            </p>
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
          {/* 팔로우 버튼 */}
          <button
            className={[
              "flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-medium transition-colors active:opacity-80",
              isFollowing
                ? "border border-neutral-200 bg-neutral-100 text-neutral-500"
                : "bg-neutral-900 text-white",
            ].join(" ")}
            aria-label={
              isFollowing
                ? `${artist.displayName} 팔로잉 중`
                : `${artist.displayName} 팔로우`
            }
          >
            {isFollowing ? "팔로잉" : "팔로우"}
          </button>

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
      </section>

      {/* ── Guest Work 일정 — 진행 중 우선 ──────────────── */}
      <section className="mt-2 bg-white px-4 py-4">
        <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-neutral-400">
          Guest Work
          {sortedSchedules.length > 0 && (
            <span className="ml-1.5 text-neutral-300">
              {sortedSchedules.length}
            </span>
          )}
        </h3>

        {sortedSchedules.length > 0 ? (
          <div className="flex flex-col gap-3">
            {sortedSchedules.map((schedule) => (
              <div key={schedule.id} className="flex flex-col gap-1.5">
                {/* 일정 상세 블록 */}
                <ScheduleBlock schedule={schedule} variant="card" />
                {/* 도시별 Bring 행 */}
                <ScheduleBringRow
                  schedule={schedule}
                  bringCount={bringCounts[schedule.id] ?? 0}
                />
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

      {/* ── 대표 작품 ─────────────────────────────────── */}
      <section className="mt-2 bg-white px-4 pb-4 pt-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400">
            대표 작품
          </h3>
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

        <div className="grid grid-cols-3 gap-0.5 overflow-hidden rounded-xl">
          {[0, 1, 2].map((i) => {
            const item = artist.portfolioItems[i];
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
      {!artist.isVerified && (
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
    </div>
  );
}

// ── 메인 페이지 ─────────────────────────────────────────────

export default async function ArtistProfilePage({ params }: Props) {
  const { handle } = await params;

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
        <ProfileContent handle={handle} />
      </Suspense>
    </PageContainer>
  );
}
