"use client";

import { useState, useMemo } from "react";
import { FeedCard } from "@/components/artist/FeedCard";
import { SearchInput } from "@/components/search/SearchInput";
import { HomeFilterBar, type PeriodFilter } from "@/components/home/HomeFilterBar";
import { HomeFilterSheet } from "@/components/home/HomeFilterSheet";
import type { FeedCard as FeedCardType } from "@/types";

/** 이번 주 범위 계산 (월~일) */
function getThisWeekRange(): { start: Date; end: Date } {
  const now = new Date();
  const day = now.getDay(); // 0=일, 1=월 ...
  const diffToMon = day === 0 ? -6 : 1 - day;
  const start = new Date(now);
  start.setDate(now.getDate() + diffToMon);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

/** 일정이 이번 주와 겹치는지 확인 */
function isThisWeek(startDate: string, endDate: string): boolean {
  const { start, end } = getThisWeekRange();
  const schedStart = new Date(startDate);
  const schedEnd = new Date(endDate);
  return schedStart <= end && schedEnd >= start;
}

interface HomeFeedClientProps {
  items: FeedCardType[];
}

export function HomeFeedClient({ items }: HomeFeedClientProps) {
  const [query, setQuery] = useState("");
  const [period, setPeriod] = useState<PeriodFilter>("all");

  // 실제 카드 리스트에 적용된 태그
  const [appliedTags, setAppliedTags] = useState<string[]>([]);
  // 바텀시트 안에서 임시 선택 중인 태그
  const [draftTags, setDraftTags] = useState<string[]>([]);

  const [sheetOpen, setSheetOpen] = useState(false);

  /** Filter 버튼 클릭 — draft를 applied 값으로 초기화한 뒤 시트 오픈 */
  function handleFilterOpen() {
    setDraftTags(appliedTags);
    setSheetOpen(true);
  }

  /** 바텀시트 내 태그 토글 — draft만 변경 */
  function handleDraftToggle(slug: string) {
    setDraftTags((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  }

  /** Apply — draft를 applied에 반영하고 시트 닫기 */
  function handleApply() {
    setAppliedTags(draftTags);
    setSheetOpen(false);
  }

  /** 배경 클릭 — draft 버리고 시트만 닫기 */
  function handleDismiss() {
    setSheetOpen(false);
    // draftTags는 다음 시트 오픈 시 handleFilterOpen에서 applied로 덮어씀
  }

  /** AND 누적 필터링 */
  const filtered = useMemo(() => {
    return items.filter((item) => {
      const { artist, schedule } = item;

      // 1. 검색어 (도시명 OR 아티스트명, 대소문자 무시)
      if (query.trim().length > 0) {
        const q = query.trim().toLowerCase();
        const matchCity = schedule.city.toLowerCase().includes(q);
        const matchName = artist.displayName.toLowerCase().includes(q);
        if (!matchCity && !matchName) return false;
      }

      // 2. 기간
      if (period === "week") {
        if (!isThisWeek(schedule.startDate, schedule.endDate)) return false;
      }

      // 3. 태그 (AND — applied 기준)
      if (appliedTags.length > 0) {
        const artistSlugs = artist.tags.map((t) => t.slug);
        const allMatch = appliedTags.every((slug) => artistSlugs.includes(slug));
        if (!allMatch) return false;
      }

      return true;
    });
  }, [items, query, period, appliedTags]);

  return (
    <>
      {/* sticky 헤더 */}
      <div className="sticky top-0 z-40 border-b border-neutral-100 bg-white px-4 pt-4 pb-0">
        <SearchInput
          value={query}
          onChange={setQuery}
          className="mb-3"
        />
        <HomeFilterBar
          period={period}
          onPeriodChange={setPeriod}
          activeTagCount={appliedTags.length}
          onFilterOpen={handleFilterOpen}
        />
      </div>

      {/* 카드 리스트 */}
      <div className="space-y-2.5 px-3 py-3">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-[14px] font-medium text-neutral-500">
              No artists match these filters.
            </p>
            <p className="mt-1 text-[12px] text-neutral-400">
              조건을 바꿔서 다시 시도해보세요.
            </p>
          </div>
        ) : (
          filtered.map((item) => (
            <FeedCard key={item.schedule.id} data={item} />
          ))
        )}
      </div>

      {/* 태그 바텀시트 */}
      <HomeFilterSheet
        isOpen={sheetOpen}
        draftSlugs={draftTags}
        onToggle={handleDraftToggle}
        onApply={handleApply}
        onDismiss={handleDismiss}
      />
    </>
  );
}
