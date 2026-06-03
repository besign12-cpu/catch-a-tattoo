"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { TagList } from "@/components/ui/TagChip";
import { formatDateRange, calcDDay, isScheduleActive } from "@/lib/utils";
import type { FeedCard as FeedCardType } from "@/types";

// ISO 국가 코드 → 국가명 (자주 쓰이는 것만)
const COUNTRY_NAMES: Record<string, string> = {
  KR: "South Korea", JP: "Japan", US: "United States",
  DE: "Germany", FR: "France", GB: "United Kingdom",
  NL: "Netherlands", TH: "Thailand", SG: "Singapore",
  CN: "China", AU: "Australia", CA: "Canada",
  IT: "Italy", ES: "Spain", BR: "Brazil",
  MX: "Mexico", HK: "Hong Kong", TW: "Taiwan",
};

function countryName(code: string) {
  return COUNTRY_NAMES[code.toUpperCase()] ?? code;
}

interface FeedCardProps {
  data: FeedCardType;
  className?: string;
}

export function FeedCard({ data, className }: FeedCardProps) {
  const { artist, schedule, isFollowing } = data;
  const status    = isScheduleActive(schedule.startDate, schedule.endDate);
  const isActive  = status === "active";
  const dday      = calcDDay(schedule.startDate, schedule.endDate);
  const dateRange = formatDateRange(schedule.startDate, schedule.endDate);

  return (
    <article
      className={cn(
        "overflow-hidden rounded-2xl border border-neutral-100 bg-white",
        className
      )}
    >
      {/* 아티스트 행 */}
      <div className="flex items-center gap-2.5 px-3 pt-3 pb-0">
        <Link
          href={`/artists/${artist.instagramHandle}`}
          className="shrink-0"
          aria-label={`${artist.displayName} 프로필`}
        >
          <Avatar name={artist.displayName} size="sm" />
        </Link>

        <div className="min-w-0 flex-1">
          <Link
            href={`/artists/${artist.instagramHandle}`}
            className="flex items-center gap-1"
          >
            <span className="text-[13px] font-medium text-neutral-900 leading-none">
              {artist.displayName}
            </span>
            {artist.isVerified && <VerifiedBadge size={12} />}
          </Link>
          <TagList tags={artist.tags} size="sm" max={3} className="mt-1.5" />
        </div>

        {/* 팔로우 버튼 */}
        <button
          className={cn(
            "shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-medium leading-none transition-colors active:scale-95",
            isFollowing
              ? "border-neutral-200 bg-neutral-100 text-neutral-500"
              : "border-neutral-300 bg-white text-neutral-800"
          )}
          aria-label={
            isFollowing
              ? `${artist.displayName} 팔로잉 중`
              : `${artist.displayName} 팔로우`
          }
        >
          {isFollowing ? "팔로잉" : "팔로우"}
        </button>
      </div>

      {/* 어디 / 언제 블록 — 라벨 없이 */}
      <Link
        href={`/artists/${artist.instagramHandle}`}
        className="block mx-3 mt-2.5 mb-3"
        aria-label={`${schedule.city} 일정 상세 보기`}
      >
        <div
          className={cn(
            "flex items-stretch rounded-xl px-3 py-2.5",
            isActive
              ? "bg-emerald-50 border border-emerald-100"
              : "bg-neutral-50 border border-neutral-100"
          )}
        >
          {/* 도시 + 국가 */}
          <div className="flex flex-1 flex-col gap-0">
            <span className="text-sm font-medium text-neutral-900 leading-snug">
              {schedule.city}
            </span>
            <span className="text-[11px] text-neutral-400 leading-snug">
              {countryName(schedule.country)}
            </span>
          </div>

          <div className="mx-3 w-px self-stretch bg-neutral-200" />

          {/* 날짜 + D-day */}
          <div className="flex flex-1 flex-col gap-0">
            <span className="text-sm font-medium text-neutral-900 leading-snug">
              {dateRange}
            </span>
            <span
              className={cn(
                "text-[11px] leading-snug font-medium",
                isActive ? "text-emerald-600" : "text-neutral-400"
              )}
            >
              {dday}
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
