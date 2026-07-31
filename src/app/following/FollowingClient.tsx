"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import Link from "next/link";
import { Bell, Calendar, Heart, ChevronRight } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { Avatar } from "@/components/ui/Avatar";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { useLocaleNav } from "@/lib/hooks/useLocaleNav";
import { useT } from "@/lib/hooks/useT";
import { toggleFollow } from "@/actions/follow";

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

// calcDDay: 번역 가능하도록 플래그 상수 반환
// 호출하는 컴포넌트에서 useT로 번역
const DDAY_IN_PROGRESS = "__IN_PROGRESS__";
const DDAY_ENDED       = "__ENDED__";

function calcDDay(startDate: string, endDate: string): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(startDate);
  const end   = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  if (today >= start && today <= end) return DDAY_IN_PROGRESS;
  if (today > end) return DDAY_ENDED;
  const diff = Math.ceil((start.getTime() - today.getTime()) / 86400000);
  return `D-${diff}`;
}

// ── 비로그인 Empty State ─────────────────────────────────────

function UnauthenticatedState({ tab }: { tab: TabType }) {
  const { href: localeHref } = useLocaleNav();
  const t = useT("following");
  const message =
    tab === "schedule"
      ? { title: t("noSchedule"), sub: t("noScheduleDesc") }
      : { title: t("noFollowing"), sub: t("noFollowingDesc") };

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
        href={localeHref("/")}
        className="mt-1 rounded-xl bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white active:opacity-80"
      >
        {t("findArtistCta")}
      </Link>
    </div>
  );
}

// ── 일정 탭 ─────────────────────────────────────────────────

function ScheduleTab({ schedules }: { schedules: FollowingScheduleItem[] }) {
  const ta = useT("artist");

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
                  {ta("inTown")}
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
                  {dday === DDAY_IN_PROGRESS
                    ? ta("inTown")
                    : dday === DDAY_ENDED
                      ? ""
                      : dday}
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

// ── 팔로우 탭 ────────────────────────────────────────────────

function FollowTab({ artists }: { artists: FollowingArtistItem[] }) {
  const ta = useT("artist");

  // ── 최초 mount 시 artists를 localArtists state로 저장 ──────
  // Server Action 완료 후 부모 서버 컴포넌트가 재렌더돼 새 artists prop이
  // 내려와도, 현재 화면 세션 동안은 localArtists를 기준으로 렌더링
  const [localArtists, setLocalArtists] = useState<FollowingArtistItem[]>(artists);

  // 이번 세션에서 언팔로우한 아티스트 ID Set
  // - 버튼 상태 즉시 전환에 사용
  // - 서버 재렌더 시 localArtists 병합 기준으로도 사용
  const [unfollowedIds, setUnfollowedIds] = useState<Set<string>>(new Set());

  const [isPending, startTransition] = useTransition();

  // ── artists prop 변경 시 localArtists 병합 ─────────────────
  // 조건: 새 prop에 있는 artist 중
  //   1. 이번 세션에서 언팔로우한 artist → localArtists 유지(제거 금지)
  //   2. 서버에서 새로 추가된 artist → localArtists에 병합
  //   3. 서버에서 사라졌고 언팔로우하지 않은 artist → 제거
  const prevArtistsPropRef = useRef<FollowingArtistItem[]>(artists);

  useEffect(() => {
    // prop이 실제로 바뀐 경우만 처리
    if (prevArtistsPropRef.current === artists) return;
    prevArtistsPropRef.current = artists;

    setLocalArtists(prev => {
      // 현재 세션 기준 artist ID Set
      const prevIds    = new Set(prev.map(a => a.id));
      const newIds     = new Set(artists.map(a => a.id));
      const unfollowed = unfollowedIds; // 클로저로 현재 값 참조

      // 새 prop에 있고 언팔로우하지 않은 것만 유효한 서버 데이터로 간주
      const validFromServer = artists.filter(a => !unfollowed.has(a.id));

      // localArtists 중 유지할 항목:
      //   - 서버에 아직 있거나 (정상)
      //   - 이번 세션에서 언팔로우한 경우 (화면 유지)
      const retained = prev.filter(a =>
        newIds.has(a.id) || unfollowed.has(a.id)
      );

      // 서버에서 새로 추가된 artist (이전에 없던 것)
      const added = validFromServer.filter(a => !prevIds.has(a.id));

      return [...retained, ...added];
    });
  // unfollowedIds는 의도적으로 deps 제외
  // — unfollowedIds가 바뀔 때마다 병합 로직을 재실행하면 안 됨
  // — artists prop 변경 시에만 병합
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [artists]);

  if (localArtists.length === 0 && unfollowedIds.size === 0) {
    return <UnauthenticatedState tab="follow" />;
  }

  function handleToggle(artistId: string, artistHandle: string) {
    const isUnfollowed = unfollowedIds.has(artistId);

    // 버튼 상태 즉시 전환
    setUnfollowedIds(prev => {
      const next = new Set(prev);
      if (isUnfollowed) next.delete(artistId); // 팔로우 복원
      else next.add(artistId);                 // 언팔로우
      return next;
    });

    const formData = new FormData();
    formData.set("artistId", artistId);
    formData.set("artistHandle", artistHandle);

    startTransition(async () => {
      const result = await toggleFollow({ status: "idle" }, formData);
      if (result.status === "error") {
        // 실패 시 버튼 상태 복원
        setUnfollowedIds(prev => {
          const next = new Set(prev);
          if (isUnfollowed) next.add(artistId);
          else next.delete(artistId);
          return next;
        });
      }
    });
  }

  return (
    <div className="flex flex-col divide-y divide-neutral-50 px-4 py-2">
      {localArtists.map(artist => {
        const isUnfollowed = unfollowedIds.has(artist.id);
        return (
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
              </div>
            </Link>

            {/* 팔로우/언팔로우 버튼 */}
            <button
              className="shrink-0 rounded-full border border-neutral-200 bg-neutral-100 px-3 py-1.5 text-[11px] font-medium text-neutral-500 active:opacity-70 disabled:opacity-40"
              aria-label={`${artist.displayName} ${isUnfollowed ? ta("follow") : ta("following")}`}
              disabled={isPending}
              onClick={() => handleToggle(artist.id, artist.instagramHandle)}
            >
              {isUnfollowed ? ta("follow") : ta("following")}
            </button>
          </div>
        );
      })}
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
  const t = useT("following");

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
      <TopBar title={t("title")} right={bellButton} />

      {/* ── 탭 바 ──────────────────────────────────────────── */}
      <div className="sticky top-[52px] z-30 flex border-b border-neutral-100 bg-white">
        {(["schedule", "follow"] as const).map(tab => {
          const label = tab === "schedule" ? t("scheduleTab") : t("followTab");
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
