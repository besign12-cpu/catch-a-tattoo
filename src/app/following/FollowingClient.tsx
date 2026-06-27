"use client";

/**
 * FollowingClient
 *
 * 핵심 정책:
 * - artists를 local state로 복사 → 화면은 local state 기준 렌더링
 * - Unfollow/Follow는 fetch POST /api/follow 로 처리
 *   (Server Action / useFormState 사용 금지 → 서버 재렌더 완전 차단)
 * - Unfollow 성공 → item의 isFollowing만 false, 카드는 유지
 * - Follow 재클릭 → isFollowing=true
 * - router.refresh() 금지
 * - 새로고침 / 재진입 시 DB 기준으로 반영
 */

import { useState, useCallback } from "react";
import Link from "next/link";
import { Bell, Calendar, Heart, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { TopBar } from "@/components/layout/TopBar";
import { Avatar } from "@/components/ui/Avatar";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { TagList } from "@/components/ui/TagChip";
import { cn } from "@/lib/utils";
import type { Tag } from "@/types";

// ── 타입 ─────────────────────────────────────────────────────

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
  isActive: boolean;
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

// ── 탭 타입 ──────────────────────────────────────────────────

type TabType = "schedule" | "follow";

// ── 날짜 유틸 ────────────────────────────────────────────────

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

// ── 빈 상태 ──────────────────────────────────────────────────

function EmptyState({ tab }: { tab: TabType }) {
  const t = useTranslations("following");
  const isSchedule = tab === "schedule";

  return (
    <div className="flex flex-col items-center gap-4 px-8 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100">
        {isSchedule
          ? <Calendar size={22} className="text-neutral-400" aria-hidden="true" />
          : <Heart    size={22} className="text-neutral-400" aria-hidden="true" />}
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-[15px] font-semibold text-neutral-800">
          {isSchedule ? t("noSchedule") : t("noFollowing")}
        </p>
        <p className="text-sm text-neutral-400 leading-relaxed whitespace-pre-line">
          {isSchedule ? t("noScheduleDesc") : t("noFollowingDesc")}
        </p>
      </div>
      <Link
        href="/"
        className="mt-1 rounded-xl bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white active:opacity-80"
      >
        {t("noFollowingDesc")}
      </Link>
    </div>
  );
}

// ── 일정 탭 (서버 props 그대로 — local state 불필요) ──────────

function ScheduleTab({ schedules }: { schedules: FollowingScheduleItem[] }) {
  if (schedules.length === 0) return <EmptyState tab="schedule" />;

  const sorted = [...schedules].sort((a, b) => {
    if (a.isActive && !b.isActive) return -1;
    if (!a.isActive && b.isActive) return 1;
    return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
  });

  return (
    <div className="flex flex-col gap-3 px-4 py-4">
      {sorted.map(item => {
        const dday      = calcDDay(item.startDate, item.endDate);
        const dateRange = formatDateRange(item.startDate, item.endDate);

        return (
          <Link
            key={item.id}
            href={`/artists/${item.artistHandle}`}
            className="block overflow-hidden rounded-2xl border border-neutral-100 bg-white active:opacity-80"
          >
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
              {item.isActive && (
                <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                  진행 중
                </span>
              )}
            </div>
            <div className={cn(
              "mx-3 mb-3 flex items-stretch rounded-xl px-3 py-2.5",
              item.isActive
                ? "border border-emerald-100 bg-emerald-50"
                : "border border-neutral-100 bg-neutral-50"
            )}>
              <div className="flex flex-1 flex-col">
                <span className="text-sm font-medium text-neutral-900 leading-snug">{item.city}</span>
                <span className="text-[11px] text-neutral-400 leading-snug">{item.country}</span>
              </div>
              <div className="mx-3 w-px self-stretch bg-neutral-200" />
              <div className="flex flex-1 flex-col">
                <span className="text-sm font-medium text-neutral-900 leading-snug">{dateRange}</span>
                <span className={cn(
                  "text-[11px] leading-snug font-medium",
                  item.isActive ? "text-emerald-600" : "text-neutral-400"
                )}>
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

// ── 팔로우 탭 ─────────────────────────────────────────────────
//
// artists와 handleToggle을 부모(FollowingClient)에서 받음.
// 탭 전환으로 언마운트/리마운트 되어도 state는 부모에서 유지됨.

interface LocalArtist extends FollowingArtistItem {
  isFollowing: boolean;
}

function FollowTab({
  artists,
  pendingId,
  onToggle,
}: {
  artists: LocalArtist[];
  pendingId: string | null;
  onToggle: (artistId: string, artistHandle: string) => void;
}) {
  const t = useTranslations("artist");
  if (artists.length === 0) return <EmptyState tab="follow" />;

  return (
    <div className="flex flex-col divide-y divide-neutral-50 px-4 py-2">
      {artists.map(artist => {
        const isPending = pendingId === artist.id;

        return (
          <div key={artist.id} className="flex items-center gap-3 py-3">
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

            <button
              onClick={() => onToggle(artist.id, artist.instagramHandle)}
              disabled={isPending}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-medium leading-none transition-colors active:scale-95",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                artist.isFollowing
                  ? "border-neutral-200 bg-neutral-100 text-neutral-500"
                  : "border-neutral-300 bg-white text-neutral-800"
              )}
              aria-pressed={artist.isFollowing}
              aria-label={artist.isFollowing
                ? `${artist.displayName} 언팔로우`
                : `${artist.displayName} 팔로우`}
            >
              {isPending ? "···" : artist.isFollowing ? t("following") : t("follow")}
            </button>
          </div>
        );
      })}
    </div>
  );
}

// ── 메인 Export ───────────────────────────────────────────────

export function FollowingClient({
  schedules,
  artists: initialArtists,
  isLoggedIn,
}: FollowingClientProps) {
  const [activeTab, setActiveTab] = useState<TabType>("schedule");
  const t = useTranslations("following");

  // ── artists local state: 최상위에서 관리 ──────────────────
  // 탭 전환으로 FollowTab이 언마운트/리마운트 되어도 state 유지
  // 초기 mount 시 1회만 initialArtists로 설정됨
  const [localArtists, setLocalArtists] = useState<LocalArtist[]>(
    () => initialArtists.map(a => ({ ...a, isFollowing: true }))
  );
  const [pendingId, setPendingId] = useState<string | null>(null);

  const handleToggle = useCallback(async (artistId: string, artistHandle: string) => {
    if (pendingId) return;
    setPendingId(artistId);

    try {
      const res = await fetch("/api/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ artistId, artistHandle }),
      });

      if (res.ok) {
        // isFollowing만 토글, 카드 제거 없음
        setLocalArtists(prev =>
          prev.map(a =>
            a.id === artistId ? { ...a, isFollowing: !a.isFollowing } : a
          )
        );
      }
    } catch {
      // 네트워크 오류 — 무시
    } finally {
      setPendingId(null);
    }
  }, [pendingId]);

  return (
    <div className="flex flex-col">
      <TopBar
        title={t("title")}
        right={
          <button
            className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100"
            aria-label="알림"
          >
            <Bell size={18} />
          </button>
        }
      />

      {/* 탭 바 */}
      <div className="flex border-b border-neutral-100">
        {(["schedule", "follow"] as TabType[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex-1 py-3 text-[13px] font-medium transition-colors",
              activeTab === tab
                ? "border-b-2 border-neutral-900 text-neutral-900"
                : "text-neutral-400"
            )}
          >
            {tab === "schedule" ? t("scheduleTab") : t("followTab")}
          </button>
        ))}
      </div>

      {/* 탭 콘텐츠 */}
      {!isLoggedIn ? (
        <EmptyState tab={activeTab} />
      ) : activeTab === "schedule" ? (
        <ScheduleTab schedules={schedules} />
      ) : (
        <FollowTab
          artists={localArtists}
          pendingId={pendingId}
          onToggle={handleToggle}
        />
      )}
    </div>
  );
}
