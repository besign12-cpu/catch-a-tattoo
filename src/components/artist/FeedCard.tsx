"use client";

import Link from "next/link";
import { ChevronRight, MapPin, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { TagList } from "@/components/ui/TagChip";
import { formatDateRange, calcDDay, isScheduleActive } from "@/lib/utils";
import type { FeedCard as FeedCardType } from "@/types";

interface FeedCardProps {
  data: FeedCardType;
  className?: string;
}

export function FeedCard({ data, className }: FeedCardProps) {
  const { artist, schedule, isFollowing } = data;
  const status = isScheduleActive(schedule.startDate, schedule.endDate);
  const isActive = status === "active";
  const dday = calcDDay(schedule.startDate, schedule.endDate);
  const dateRange = formatDateRange(schedule.startDate, schedule.endDate);

  return (
    <article
      className={cn(
        "overflow-hidden rounded-2xl border border-neutral-100 bg-white",
        className
      )}
    >
      {/* 아티스트 정보 */}
      <div className="flex items-center gap-2.5 px-3 pt-3 pb-0">
        <Link
          href={`/artists/${artist.instagramHandle}`}
          className="shrink-0"
          aria-label={`${artist.displayName} 프로필 보기`}
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
            {artist.isVerified && <VerifiedBadge size={13} />}
          </Link>
          <TagList
            tags={artist.tags}
            size="sm"
            max={3}
            className="mt-1.5"
          />
        </div>

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

      {/* 어디 / 언제 블록 */}
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
          {/* 어디 */}
          <div className="flex flex-1 flex-col gap-0.5">
            <span className="flex items-center gap-0.5 text-[10px] text-neutral-400">
              <MapPin size={10} aria-hidden="true" />
              어디
            </span>
            <span className="text-sm font-medium text-neutral-900 leading-snug">
              {schedule.city}
            </span>
            {schedule.note && (
              <span className="text-[11px] text-neutral-400 line-clamp-1">
                {schedule.note.split("·")[0].trim()}
              </span>
            )}
          </div>

          <div className="mx-2.5 w-px self-stretch bg-neutral-200" />

          {/* 언제 */}
          <div className="flex flex-1 flex-col gap-0.5">
            <span className="flex items-center gap-0.5 text-[10px] text-neutral-400">
              <Calendar size={10} aria-hidden="true" />
              언제
            </span>
            <span className="text-sm font-medium text-neutral-900 leading-snug">
              {dateRange}
            </span>
            <span
              className={cn(
                "text-[11px] font-medium",
                isActive ? "text-emerald-600" : "text-neutral-400"
              )}
            >
              {dday}
            </span>
          </div>

          <ChevronRight
            size={16}
            className="ml-1 self-center shrink-0 text-neutral-300"
            aria-hidden="true"
          />
        </div>
      </Link>
    </article>
  );
}
