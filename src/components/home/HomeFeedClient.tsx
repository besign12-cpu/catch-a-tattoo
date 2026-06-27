"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { FeedCard } from "@/components/artist/FeedCard";
import { SearchInput } from "@/components/search/SearchInput";
import { HomeFilterBar, type PeriodFilter } from "@/components/home/HomeFilterBar";
import { HomeFilterSheet } from "@/components/home/HomeFilterSheet";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { useAnalytics } from "@/lib/hooks/useAnalytics";
import type { FeedCard as FeedCardType } from "@/types";

/** 이번 주 범위 계산 (월~일) */
function getThisWeekRange(): { start: Date; end: Date } {
  const now = new Date();
  const day = now.getDay();
  const diffToMon = day === 0 ? -6 : 1 - day;
  const start = new Date(now);
  start.setDate(now.getDate() + diffToMon);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

function isThisWeek(startDate: string, endDate: string): boolean {
  const { start, end } = getThisWeekRange();
  const schedStart = new Date(startDate);
  const schedEnd = new Date(endDate);
  return schedStart <= end && schedEnd >= start;
}

/** AND 누적 필터 */
function applyFilters(
  items: FeedCardType[],
  query: string,
  period: PeriodFilter,
  appliedTags: string[]
): FeedCardType[] {
  return items.filter(({ artist, schedule }) => {
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      if (
        !schedule.city.toLowerCase().includes(q) &&
        !artist.displayName.toLowerCase().includes(q)
      )
        return false;
    }
    if (period === "week" && !isThisWeek(schedule.startDate, schedule.endDate))
      return false;
    if (appliedTags.length > 0) {
      const slugs = artist.tags.map((t) => t.slug);
      if (!appliedTags.every((s) => slugs.includes(s))) return false;
    }
    return true;
  });
}

interface SectionHeaderProps {
  title: string;
  href: string;
}

function SectionHeader({ title, href }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 pb-2 pt-5">
      <h2 className="text-[13px] font-semibold text-neutral-800">{title}</h2>
      <Link
        href={href}
        className="flex items-center gap-0.5 text-[12px] text-neutral-400 active:text-neutral-600"
      >
        더보기
        <ChevronRight size={13} strokeWidth={2} />
      </Link>
    </div>
  );
}

interface HomeFeedClientProps {
  guestItems: FeedCardType[];
  basedItems: FeedCardType[];
  baseCity: string;
  citySlug: string;
  isLoggedIn?: boolean;
}

export function HomeFeedClient({
  guestItems,
  basedItems,
  baseCity,
  citySlug,
  isLoggedIn = false,
}: HomeFeedClientProps) {
  const [query, setQuery] = useState("");
  const [period, setPeriod] = useState<PeriodFilter>("all");
  const [appliedTags, setAppliedTags] = useState<string[]>([]);
  const [draftTags, setDraftTags] = useState<string[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);

  const t = useTranslations("discover");
  const { trackArtistSearch, trackStyleSearch, trackCombinedSearch } = useAnalytics();

  // filteredGuest/Based는 useMemo 이후에 참조해야 하므로 수집은 useEffect로 처리
  // 검색어 debounce 수집 (500ms, 2자 이상)
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    const trimmed = query.trim();
    if (trimmed.length < 2) return;
    searchTimerRef.current = setTimeout(() => {
      if (appliedTags.length > 0) {
        trackCombinedSearch(trimmed, appliedTags, 0);
      } else {
        trackArtistSearch(trimmed, 0);
      }
    }, 500);
    return () => { if (searchTimerRef.current) clearTimeout(searchTimerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  // 태그 필터 적용 시 수집 (적용된 태그가 변경될 때)
  const prevAppliedTagsRef = useRef<string>("");
  useEffect(() => {
    const key = appliedTags.slice().sort().join(",");
    if (key === prevAppliedTagsRef.current || appliedTags.length === 0) {
      prevAppliedTagsRef.current = key;
      return;
    }
    prevAppliedTagsRef.current = key;
    if (query.trim().length > 0) {
      trackCombinedSearch(query.trim(), appliedTags, 0);
    } else {
      trackStyleSearch(appliedTags, 0);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedTags]);

  function handleFilterOpen() {
    setDraftTags(appliedTags);
    setSheetOpen(true);
  }

  function handleDraftToggle(slug: string) {
    setDraftTags((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  }

  function handleDraftReset() {
    setDraftTags([]);
  }

  function handleApply() {
    setAppliedTags(draftTags);
    setSheetOpen(false);
  }

  function handleDismiss() {
    setSheetOpen(false);
  }

  const isFiltering =
    query.trim().length > 0 || period !== "all" || appliedTags.length > 0;

  const filteredGuest = useMemo(
    () => applyFilters(guestItems, query, period, appliedTags),
    [guestItems, query, period, appliedTags]
  );
  const filteredBased = useMemo(
    () => applyFilters(basedItems, query, period, appliedTags),
    [basedItems, query, period, appliedTags]
  );

  const totalFiltered = filteredGuest.length + filteredBased.length;

  return (
    <>
      {/* sticky 헤더 */}
      <div className="sticky top-0 z-40 border-b border-neutral-100 bg-white px-4 pt-4 pb-0">
        {/* 상단 행: 검색 + Language 버튼 */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1">
            <SearchInput value={query} onChange={setQuery} />
          </div>
          {/* Language Switcher — Discover 우상단, 비로그인 접근 가능 */}
          <LanguageSwitcher variant="topbar" />
        </div>
        <HomeFilterBar
          period={period}
          onPeriodChange={setPeriod}
          activeTagCount={appliedTags.length}
          onFilterOpen={handleFilterOpen}
        />
      </div>

      {/* 필터 결과 없음 */}
      {isFiltering && totalFiltered === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-[14px] font-medium text-neutral-500">
            {t("noGuests")}
          </p>
        </div>
      ) : (
        <div className="pb-6">
          {/* Upcoming Guest Artists 섹션 */}
          <SectionHeader
            title={t("guestArtists", { city: baseCity })}
            href={`/city/${citySlug}?tab=guest`}
          />
          {filteredGuest.length === 0 ? (
            <p className="px-4 py-4 text-[12px] text-neutral-400">
              {t("noGuests")}
            </p>
          ) : (
            <div className="space-y-2.5 px-3 pt-1">
              {filteredGuest.map((item) => (
                <FeedCard key={item.schedule.id} data={item} isLoggedIn={isLoggedIn} />
              ))}
            </div>
          )}

          {/* Based Artists 섹션 */}
          <SectionHeader
            title={t("basedArtists", { city: baseCity })}
            href={`/city/${citySlug}?tab=based`}
          />
          {filteredBased.length === 0 ? (
            <p className="px-4 py-4 text-[12px] text-neutral-400">
              {t("noBased")}
            </p>
          ) : (
            <div className="space-y-2.5 px-3 pt-1">
              {filteredBased.map((item) => (
                <FeedCard key={item.schedule.id} data={item} isLoggedIn={isLoggedIn} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* 태그 바텀시트 */}
      <HomeFilterSheet
        isOpen={sheetOpen}
        draftSlugs={draftTags}
        onToggle={handleDraftToggle}
        onReset={handleDraftReset}
        onApply={handleApply}
        onDismiss={handleDismiss}
      />
    </>
  );
}
