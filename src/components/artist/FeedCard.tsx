"use client";

import Link from "next/link";
import { MapPin, Calendar } from "lucide-react";
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
  const { artist, schedule } = data;
  const status   = isScheduleActive(schedule.startDate, schedule.endDate);
  const isActive = status === "active";
  const dday     = calcDDay(schedule.startDate, schedule.endDate);
  const dateRange = formatDateRange(schedule.startDate, schedule.endDate);

  return (
    <Link
      href={`/artists/${artist.instagramHandle}`}
      className={cn(
        "flex flex-col gap-0 overflow-hidden rounded-2xl border border-neutral-100 bg-white active:opacity-90",
        className
      )}
      aria-label={`${artist.displayName} — ${schedule.city} ${dateRange}`}
    >
      {/* 아티스트 행 */}
      <div className="flex items-center gap-2.5 px-3 pt-3 pb-2">
        <Avatar name={artist.displayName} size="sm" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1 mb-1">
            <span className="text-[13px] font-medium text-neutral-900 leading-none">
              {artist.displayName}
            </span>
            {artist.isVerified && <VerifiedBadge size={12} />}
          </div>
          <TagList tags={artist.tags} size="sm" max={3} />
        </div>
      </div>

      {/* 어디 / 언제 블록 */}
      <div
        className={cn(
          "flex items-stretch mx-3 mb-3 rounded-xl px-3 py-2.5 gap-0",
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
          <span className="text-sm font-medium text-neutral-900">
            {schedule.city}
          </span>
        </div>

        <div className="mx-3 w-px self-stretch bg-neutral-200" />

        {/* 언제 */}
        <div className="flex flex-1 flex-col gap-0.5">
          <span className="flex items-center gap-0.5 text-[10px] text-neutral-400">
            <Calendar size={10} aria-hidden="true" />
            언제
          </span>
          <span className="text-sm font-medium text-neutral-900">
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
      </div>
    </Link>
  );
}
