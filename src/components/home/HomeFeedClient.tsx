"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { ChevronRight, MapPin, X } from "lucide-react";
import { FeedCard } from "@/components/artist/FeedCard";
import { HomeFilterBar, type PeriodFilter } from "@/components/home/HomeFilterBar";
import { HomeFilterSheet } from "@/components/home/HomeFilterSheet";
import type { FeedCard as FeedCardType } from "@/types";

// ── 타입 ──────────────────────────────────────────────────────

interface CityOption {
  id: string;
  name: string;
  country: string;
  countryName: string;
  region: string;
}

interface HomeFeedClientProps {
  guestItems: FeedCardType[];
  basedItems: FeedCardType[];
  baseCity: string;
  baseCountry: string;
  citySlug: string;
  cities: CityOption[];
}

// ── 유틸 ──────────────────────────────────────────────────────

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
  const schedEnd   = new Date(endDate);
  return schedStart <= end && schedEnd >= start;
}

function applyFilters(
  items: FeedCardType[],
  period: PeriodFilter,
  appliedTags: string[]
): FeedCardType[] {
  return items.filter(({ artist, schedule }) => {
    if (period === "week" && !isThisWeek(schedule.startDate, schedule.endDate))
      return false;
    if (appliedTags.length > 0) {
      const slugs = artist.tags.map((t) => t.slug);
      if (!appliedTags.every((s) => slugs.includes(s))) return false;
    }
    return true;
  });
}

// ── 메인 컴포넌트 ─────────────────────────────────────────────

export function HomeFeedClient({
  guestItems: initialGuestItems,
  basedItems: initialBasedItems,
  baseCity,
  baseCountry,
  citySlug: initialCitySlug,
  cities,
}: HomeFeedClientProps) {
  // ── 도시 state ──────────────────────────────────────────────
  const [currentCity,     setCurrentCity]    = useState(baseCity);
  const [currentCountry,  setCurrentCountry] = useState(baseCountry);
  const [currentCitySlug, setCurrentCitySlug] = useState(initialCitySlug);
  const [guestItems,      setGuestItems]     = useState(initialGuestItems);
  const [basedItems,      setBasedItems]     = useState(initialBasedItems);
  const [cityLoading,     setCityLoading]    = useState(false);

  // ── 검색 state ──────────────────────────────────────────────
  const [query,          setQuery]          = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // ── 필터 state ──────────────────────────────────────────────
  const [period,      setPeriod]      = useState<PeriodFilter>("all");
  const [appliedTags, setAppliedTags] = useState<string[]>([]);
  const [draftTags,   setDraftTags]   = useState<string[]>([]);
  const [sheetOpen,   setSheetOpen]   = useState(false);

  // ── 도시 변경 핸들러 ─────────────────────────────────────────
  const handleCitySelect = useCallback(async (city: CityOption) => {
    if (city.name === currentCity) {
      setQuery("");
      setIsSearchFocused(false);
      return;
    }
    setQuery("");
    setIsSearchFocused(false);
    setCurrentCity(city.name);
    setCurrentCountry(city.country);
    setCityLoading(true);

    try {
      const res = await fetch(
        `/api/discover/city?city=${encodeURIComponent(city.name)}&country=${encodeURIComponent(city.country)}`
      );
      if (res.ok) {
        const data = await res.json() as {
          guestItems: FeedCardType[];
          basedItems: FeedCardType[];
          citySlug: string;
        };
        setGuestItems(data.guestItems);
        setBasedItems(data.basedItems);
        setCurrentCitySlug(data.citySlug);
      } else {
        console.error("[HomeFeedClient] 도시 변경 API 실패:", res.status);
      }
    } catch (err) {
      console.error("[HomeFeedClient] 도시 변경 API 오류:", err);
    } finally {
      setCityLoading(false);
    }
  }, [currentCity]);

  // ── 검색 결과 계산 ───────────────────────────────────────────
  const trimmedQuery = query.trim().toLowerCase();

  const matchedCities = useMemo(() => {
    if (!trimmedQuery) return [];
    return cities
      .filter(c =>
        c.name.toLowerCase().includes(trimmedQuery) ||
        c.countryName.toLowerCase().includes(trimmedQuery)
      )
      .slice(0, 4);
  }, [cities, trimmedQuery]);

  const isSearching = isSearchFocused && trimmedQuery.length > 0;

  // ── 피드 필터 ────────────────────────────────────────────────
  const filteredGuest = useMemo(
    () => applyFilters(guestItems, period, appliedTags),
    [guestItems, period, appliedTags]
  );
  const filteredBased = useMemo(
    () => applyFilters(basedItems, period, appliedTags),
    [basedItems, period, appliedTags]
  );

  return (
    <>
      {/* ── sticky 헤더 ─────────────────────────────────────── */}
      <div className="sticky top-0 z-40 border-b border-neutral-100 bg-white px-4 pt-4 pb-0">
        {/* 검색창 */}
        <div className="relative mb-3">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setTimeout(() => setIsSearchFocused(false), 150)}
            placeholder="도시 또는 아티스트 검색"
            className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-[13px] text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-400 focus:bg-white"
            aria-label="도시 검색"
          />
          {query && (
            <button
              onMouseDown={e => e.preventDefault()}
              onClick={() => { setQuery(""); setIsSearchFocused(false); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400"
              aria-label="검색어 지우기"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* 필터바 (검색 중이 아닐 때) */}
        {!isSearching && (
          <HomeFilterBar
            period={period}
            onPeriodChange={setPeriod}
            activeTagCount={appliedTags.length}
            onFilterOpen={() => { setDraftTags(appliedTags); setSheetOpen(true); }}
          />
        )}
      </div>

      {/* ── 도시 검색 드롭다운 ─────────────────────────────────── */}
      {isSearching && (
        <div className="flex flex-col bg-white border-b border-neutral-100">
          {matchedCities.length > 0 ? (
            <div className="px-4 py-3">
              <p className="mb-2 text-[10px] font-semibold tracking-widest text-neutral-400 uppercase">
                Cities
              </p>
              {matchedCities.map(city => (
                <button
                  key={city.id}
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => handleCitySelect(city)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-neutral-50 active:bg-neutral-100 transition-colors"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100">
                    <MapPin size={14} className="text-neutral-500" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1 text-left">
                    <p className="text-[13px] font-medium text-neutral-900">{city.name}</p>
                    <p className="text-[11px] text-neutral-400">{city.countryName}</p>
                  </div>
                  {city.name === currentCity && (
                    <span className="shrink-0 rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] text-neutral-500">
                      현재
                    </span>
                  )}
                </button>
              ))}
            </div>
          ) : (
            trimmedQuery.length >= 2 && (
              <div className="px-4 py-8 text-center">
                <p className="text-[13px] text-neutral-400">검색 결과가 없습니다</p>
              </div>
            )
          )}
        </div>
      )}

      {/* ── 현재 도시 헤더 ──────────────────────────────────────── */}
      {!isSearching && (
        <div className="flex items-start justify-between px-4 pt-5 pb-1">
          <div>
            <h2 className="text-[18px] font-bold text-neutral-900 leading-tight">
              {cityLoading ? <span className="text-neutral-300">···</span> : currentCity}
            </h2>
            <p className="text-[12px] text-neutral-400 mt-0.5">{currentCountry}</p>
          </div>
          <Link
            href={`/city/${currentCitySlug}`}
            className="mt-1 flex items-center gap-0.5 text-[12px] text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            더보기
            <ChevronRight size={13} strokeWidth={2} />
          </Link>
        </div>
      )}

      {/* ── 피드 ──────────────────────────────────────────────── */}
      {!isSearching && (
        cityLoading ? (
          <div className="flex items-center justify-center py-16">
            <p className="text-[13px] text-neutral-300">로딩 중...</p>
          </div>
        ) : (
          <div className="pb-6">
            {/* Guest Artists */}
            <div className="px-4 pb-2 pt-4">
              <h3 className="text-[13px] font-semibold text-neutral-800">
                Upcoming Guest Artists in {currentCity}
              </h3>
            </div>
            {filteredGuest.length === 0 ? (
              <p className="px-4 py-4 text-[12px] text-neutral-400">
                {appliedTags.length > 0 || period !== "all"
                  ? "조건에 맞는 게스트 아티스트가 없습니다."
                  : `${currentCity}에 예정된 Guest Work가 없습니다.`}
              </p>
            ) : (
              <div className="space-y-2.5 px-3 pt-1">
                {filteredGuest.map(item => (
                  <FeedCard key={item.schedule.id} data={item} />
                ))}
              </div>
            )}

            {/* Based Artists */}
            <div className="px-4 pb-2 pt-5">
              <h3 className="text-[13px] font-semibold text-neutral-800">
                Based Artists in {currentCity}
              </h3>
            </div>
            {filteredBased.length === 0 ? (
              <p className="px-4 py-4 text-[12px] text-neutral-400">
                {appliedTags.length > 0 || period !== "all"
                  ? "조건에 맞는 베이스드 아티스트가 없습니다."
                  : `${currentCity}에 등록된 Based Artist가 없습니다.`}
              </p>
            ) : (
              <div className="space-y-2.5 px-3 pt-1">
                {filteredBased.map(item => (
                  <FeedCard key={item.schedule.id} data={item} />
                ))}
              </div>
            )}
          </div>
        )
      )}

      {/* 태그 바텀시트 */}
      <HomeFilterSheet
        isOpen={sheetOpen}
        draftSlugs={draftTags}
        onToggle={(slug) => setDraftTags(prev =>
          prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]
        )}
        onReset={() => setDraftTags([])}
        onApply={() => { setAppliedTags(draftTags); setSheetOpen(false); }}
        onDismiss={() => setSheetOpen(false)}
      />
    </>
  );
}
