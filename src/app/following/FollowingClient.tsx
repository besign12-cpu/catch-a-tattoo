"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, Calendar, Heart, ChevronRight } from "lucide-react";
import { useFormState, useFormStatus } from "react-dom";
import { TopBar } from "@/components/layout/TopBar";
import { Avatar } from "@/components/ui/Avatar";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { TagList } from "@/components/ui/TagChip";
import { toggleFollow, type FollowState } from "@/actions/follow";
import { cn } from "@/lib/utils";
import type { Tag } from "@/types";

// ── 타입 ────────────────────────────────────────────────────
// Sprint 5에서 실데이터로 교체 예정

export interface FollowingScheduleItem {
  id: string;
  artistId: string;
  artistName: string;
  artistHandle: string;
  isVerified: boolean;
  city: string;
  country: string;
  startDate: string;
  endDate: string;
  isActive: boolean; // 진행 중 여부
}

export interface FollowingArtistItem {
  id: string;
  displayName: string;
  instagramHandle: string;
  isVerified: boolean;
  baseCity: string | null;
  baseCountry: string | null;
  tags: Tag[];
}

export interface FollowingClientProps {
  schedules: FollowingScheduleItem[];
  artists: FollowingArtistItem[];
  isLoggedIn: boolean;
}

// ── 탭 타입 ─────────────────────────────────────────────────

type TabType = "schedule" | "follow";

// ── 날짜 포맷 유틸 (ScheduleBlock 의존 없이 간단 처리) ──────

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function formatDateRange(start: string, end: string): string {
  return `${formatDate(start)} – ${formatDate(end)}`;
}

function calcDDay(startDate: string, endDate: string): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(startDate);
  const end   = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  if (today >= start && today <= end) return "진행 중";
  if (today > end) return "종료";
  const diff = Math.ceil((start.getTime() - today.getTime()) / 86400000);
  return `D-${diff}`;
}

// ── 비로그인 Empty State ─────────────────────────────────────

function UnauthenticatedState({ tab }: { tab: TabType }) {
  const message =
    tab === "schedule"
      ? { title: "팔로우한 아티스트 일정이 없습니다", sub: "아티스트를 팔로우하면\n일정을 여기서 확인할 수 있습니다" }
      : { title: "팔로우한 아티스트가 없습니다", sub: "아티스트를 팔로우하면\n여기에 표시됩니다" };

  return (
    <div className="flex flex-col items-center gap-4 px-8 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100">
        {tab === "schedule"
          ? <Calendar size={22} className="text-neutral-400" aria-hidden="true" />
          : <Heart size={22} className="text-neutral-400" aria-hidden="true" />
        }
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-[15px] font-semibold text-neutral-800">{message.title}</p>
        <p className="text-sm text-neutral-400 leading-relaxed whitespace-pre-line">
          {message.sub}
        </p>
      </div>
      <Link
        href="/"
        className="mt-1 rounded-xl bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white active:opacity-80"
      >
        아티스트 찾기
      </Link>
    </div>
  );
}

// ── 일정 탭 ─────────────────────────────────────────────────

function ScheduleTab({ schedules }: { schedules: FollowingScheduleItem[] }) {
  if (schedules.length === 0) {
    return <UnauthenticatedState tab="schedule" />;
  }

  // 진행 중 → 예정 순 정렬
  const sorted = [...schedules].sort((a, b) => {
    if (a.isActive && !b.isActive) return -1;
    if (!a.isActive && b.isActive) return 1;
    return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
  });

  return (
    <div className="flex flex-col gap-3 px-4 py-4">
      {sorted.map(item => {
        const dday = calcDDay(item.startDate, item.endDate);
        const dateRange = formatDateRange(item.startDate, item.endDate);
        const isActive = item.isActive;

        return (
          <Link
            key={item.id}
            href={`/artists/${item.artistHandle}`}
            className="block overflow-hidden rounded-2xl border border-neutral-100 bg-white active:opacity-80"
          >
            {/* 아티스트 행 */}
            <div className="flex items-center gap-2.5 px-3 pt-3 pb-2">
              <Avatar name={item.artistName} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <span className="text-[13px] font-medium text-neutral-900 leading-none">
                    {item.artistName}
                  </span>
                  {item.isVerified && <VerifiedBadge size={12} />}
                </div>
              </div>
              {/* 진행 중 뱃지 */}
              {isActive && (
                <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                  진행 중
                </span>
              )}
            </div>

            {/* 일정 블록 */}
            <div
              className={[
                "mx-3 mb-3 flex items-stretch rounded-xl px-3 py-2.5",
                isActive
                  ? "border border-emerald-100 bg-emerald-50"
                  : "border border-neutral-100 bg-neutral-50",
              ].join(" ")}
            >
              {/* 도시 */}
              <div className="flex flex-1 flex-col gap-0">
                <span className="text-sm font-medium text-neutral-900 leading-snug">
                  {item.city}
                </span>
                <span className="text-[11px] text-neutral-400 leading-snug">
                  {item.country}
                </span>
              </div>

              <div className="mx-3 w-px self-stretch bg-neutral-200" />

              {/* 날짜 */}
              <div className="flex flex-1 flex-col gap-0">
                <span className="text-sm font-medium text-neutral-900 leading-snug">
                  {dateRange}
                </span>
                <span
                  className={[
                    "text-[11px] leading-snug font-medium",
                    isActive ? "text-emerald-600" : "text-neutral-400",
                  ].join(" ")}
                >
                  {dday}
                </span>
              </div>

              <ChevronRight size={16} className="ml-1 self-center text-neutral-300" aria-hidden="true" />
            </div>
          </Link>
        );
      })}
    </div>
  );
}

// ── InlineFollowButton ────────────────────────────────────────
//
// Following 탭 전용 Follow/Unfollow 버튼.
// router.refresh() 없이 로컬 isFollowing 상태만 토글.
// → Unfollow 해도 카드는 유지, 버튼 상태만 변경.
// → 실수로 Unfollow 시 같은 버튼으로 즉시 재Follow 가능.
// → 페이지 이탈 후 재진입하면 DB 기준으로 반영됨.

function InlineFollowSubmit({
  isFollowing,
  displayName,
}: {
  isFollowing: boolean;
  displayName: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-medium leading-none transition-colors active:scale-95",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        isFollowing
          ? "border-neutral-200 bg-neutral-100 text-neutral-500"
          : "border-neutral-300 bg-white text-neutral-800"
      )}
      aria-label={isFollowing ? `${displayName} 언팔로우` : `${displayName} 팔로우`}
      aria-pressed={isFollowing}
    >
      {pending ? "···" : isFollowing ? "팔로잉" : "팔로우"}
    </button>
  );
}

const followInitialState: FollowState = { status: "idle" };

function InlineFollowButton({
  artistId,
  artistHandle,
  artistDisplayName,
}: {
  artistId: string;
  artistHandle: string;
  artistDisplayName: string;
}) {
  // 로컬 isFollowing 상태 — 초기값은 true (Following 탭에 있으므로)
  const [localIsFollowing, setLocalIsFollowing] = useState(true);
  const [state, formAction] = useFormState(toggleFollow, followInitialState);

  // 성공 시 로컬 상태만 토글 (router.refresh 호출 안 함)
  // → 카드는 유지, 버튼만 팔로우↔팔로잉 전환
  const handleAction = async (formData: FormData) => {
    const result = await formAction(formData);
    // useFormState는 반환값을 직접 받지 않으므로
    // state 변화는 다음 렌더에서 감지 — 대신 낙관적으로 즉시 토글
    setLocalIsFollowing((prev) => !prev);
    return result;
  };

  return (
    <div>
      <form action={handleAction}>
        <input type="hidden" name="artistId" value={artistId} />
        <input type="hidden" name="artistHandle" value={artistHandle} />
        <InlineFollowSubmit
          isFollowing={localIsFollowing}
          displayName={artistDisplayName}
        />
      </form>
      {state.status === "error" && (
        <p className="mt-0.5 text-[10px] text-red-500">{state.message}</p>
      )}
    </div>
  );
}

// ── 팔로우 탭 ────────────────────────────────────────────────

function FollowTab({ artists }: { artists: FollowingArtistItem[] }) {
  if (artists.length === 0) {
    return <UnauthenticatedState tab="follow" />;
  }

  return (
    <div className="flex flex-col divide-y divide-neutral-50 px-4 py-2">
      {artists.map(artist => (
        <div key={artist.id} className="flex items-center gap-3 py-3">
          {/* 아바타 + 이름 */}
          <Link
            href={`/artists/${artist.instagramHandle}`}
            className="flex flex-1 items-center gap-3 min-w-0"
          >
            <Avatar name={artist.displayName} size="sm" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <span className="text-[14px] font-medium text-neutral-900 truncate leading-tight">
                  {artist.displayName}
                </span>
                {artist.isVerified && <VerifiedBadge size={12} />}
              </div>
              {artist.baseCity && (
                <span className="text-[12px] text-neutral-400 leading-tight">
                  {artist.baseCity}
                  {artist.baseCountry ? `, ${artist.baseCountry}` : ""}
                </span>
              )}
              {artist.tags.length > 0 && (
                <TagList tags={artist.tags} size="sm" max={3} className="mt-1" />
              )}
            </div>
          </Link>

          {/* 팔로잉 버튼 — 카드 유지, 상태만 로컬 토글 */}
          <InlineFollowButton
            artistId={artist.id}
            artistHandle={artist.instagramHandle}
            artistDisplayName={artist.displayName}
          />
        </div>
      ))}
    </div>
  );
}

// ── 메인 Export ─────────────────────────────────────────────

export function FollowingClient({
  schedules,
  artists,
  isLoggedIn,
}: FollowingClientProps) {
  const [activeTab, setActiveTab] = useState<TabType>("schedule");

  // 알림 버튼 (우상단) — Sprint 5에서 실동작 연결 예정
  const bellButton = isLoggedIn ? (
    <button
      className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100 transition-colors active:opacity-70"
      aria-label="알림"
      onClick={() => {
        // Sprint 5: 알림 패널 연결 예정
      }}
    >
      <Bell size={20} strokeWidth={1.6} aria-hidden="true" />
    </button>
  ) : null;

  return (
    <>
      <TopBar title="팔로우" right={bellButton} />

      {/* ── 탭 바 ──────────────────────────────────────────── */}
      <div className="sticky top-[52px] z-30 flex border-b border-neutral-100 bg-white">
        {(["schedule", "follow"] as const).map(tab => {
          const label = tab === "schedule" ? "일정" : "팔로우";
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={[
                "flex flex-1 items-center justify-center py-3 text-[14px] font-medium transition-colors",
                isActive
                  ? "border-b-2 border-neutral-900 text-neutral-900"
                  : "text-neutral-400",
              ].join(" ")}
              aria-selected={isActive}
              role="tab"
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* ── 탭 콘텐츠 ──────────────────────────────────────── */}
      <div role="tabpanel">
        {activeTab === "schedule"
          ? <ScheduleTab schedules={schedules} />
          : <FollowTab artists={artists} />
        }
      </div>
    </>
  );
}
