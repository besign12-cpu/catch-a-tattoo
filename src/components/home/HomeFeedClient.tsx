"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { ChevronRight, MapPin, X } from "lucide-react";
import { FeedCard } from "@/components/artist/FeedCard";
import { HomeFilterBar, type PeriodFilter } from "@/components/home/HomeFilterBar";
import { HomeFilterSheet } from "@/components/home/HomeFilterSheet";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { useAnalytics } from "@/lib/hooks/useAnalytics";
import { useT } from "@/lib/hooks/useT";
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
  isLoggedIn?: boolean;
  /** cities 마스터 목록 (검색용) */
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
  isLoggedIn = false,
  cities,
}: HomeFeedClientProps) {
  // ── 도시 state ──────────────────────────────────────────────
  const [currentCity,    setCurrentCity]    = useState(baseCity);
  const [currentCountry, setCurrentCountry] = useState(baseCountry);
  const [currentCitySlug, setCurrentCitySlug] = useState(initialCitySlug);
  const [guestItems, setGuestItems] = useState(initialGuestItems);
  const [basedItems, setBasedItems] = useState(initialBasedItems);
  const [cityLoading, setCityLoading] = useState(false);

  // ── 검색 state ──────────────────────────────────────────────
  const [query,    setQuery]    = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // ── 필터 state ──────────────────────────────────────────────
  const [period,       setPeriod]       = useState<PeriodFilter>("all");
  const [appliedTags,  setAppliedTags]  = useState<string[]>([]);
  const [draftTags,    setDraftTags]    = useState<string[]>([]);
  const [sheetOpen,    setSheetOpen]    = useState(false);

  const t   = useT("discover");
  const tc  = useT("common");
  const tst = useT("settings");
  const { trackArtistSearch, trackStyleSearch, trackCombinedSearch, trackCityClick } = useAnalytics();

  // ── 검색 debounce ───────────────────────────────────────────
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

  // ── 도시 선택 핸들러 ─────────────────────────────────────────
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
    trackCityClick(city.name);

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
      }
    } catch { /* silent */ }
    finally { setCityLoading(false); }
  }, [currentCity, trackCityClick]);

  // ── 검색 결과 계산 ───────────────────────────────────────────
  const trimmedQuery = query.trim().toLowerCase();

  // Cities 검색 (최대 3개)
  const matchedCities = useMemo(() => {
    if (!trimmedQuery) return [];
    return cities
      .filter(c =>
        c.name.toLowerCase().includes(trimmedQuery) ||
        c.countryName.toLowerCase().includes(trimmedQuery)
      )
      .slice(0, 3);
  }, [cities, trimmedQuery]);

  // 검색창에서 검색 중인지 (도시 검색 결과 or 2자 이상 입력)
  const isSearching = isSearchFocused && trimmedQuery.length > 0;

  // ── 피드 필터 (태그/기간) ────────────────────────────────────
  const filteredGuest = useMemo(
    () => applyFilters(guestItems, period, appliedTags),
    [guestItems, period, appliedTags]
  );
  const filteredBased = useMemo(
    () => applyFilters(basedItems, period, appliedTags),
    [basedItems, period, appliedTags]
  );

  // ── 이벤트 핸들러 ─────────────────────────────────────────────
  function handleFilterOpen() { setDraftTags(appliedTags); setSheetOpen(true); }
  function handleDraftToggle(slug: string) {
    setDraftTags(prev => prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]);
  }

  return (
    <>
      {/* ── sticky 헤더 ─────────────────────────────────────── */}
      <div className="sticky top-0 z-40 border-b border-neutral-100 bg-white px-4 pt-4 pb-0">
        {/* 검색창 + Language 버튼 */}
        <div className="flex items-center gap-2 mb-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => {
                // 약간의 delay: 도시 클릭 이벤트보다 blur가 먼저 실행되는 것 방지
                setTimeout(() => setIsSearchFocused(false), 150);
              }}
              placeholder={t("searchPlaceholder")}
              className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-[13px] text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-400 focus:bg-white"
              aria-label="검색"
            />
            {query && (
              <button
                onMouseDown={e => e.preventDefault()} // blur 방지
                onClick={() => { setQuery(""); setIsSearchFocused(false); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                aria-label="검색어 지우기"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <LanguageSwitcher variant="topbar" />
        </div>

        {/* 검색 중이 아닐 때만 필터바 표시 */}
        {!isSearching && (
          <HomeFilterBar
            period={period}
            onPeriodChange={setPeriod}
            activeTagCount={appliedTags.length}
            onFilterOpen={handleFilterOpen}
          />
        )}
      </div>

      {/* ── 검색 결과 드롭다운 ─────────────────────────────────── */}
      {isSearching && (
        <div className="flex flex-col bg-white">
          {/* Cities 섹션 */}
          {matchedCities.length > 0 && (
            <div className="px-4 pt-4 pb-2">
              <p className="mb-2 text-[10px] font-semibold tracking-widest text-neutral-400 uppercase">
                Cities
              </p>
              {matchedCities.map(city => (
                <button
                  key={city.id}
                  onMouseDown={e => e.preventDefault()} // blur 방지
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
                      {tst("baseCityCurrent")}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* 구분선 */}
          {matchedCities.length > 0 && (
            <div className="mx-4 border-t border-neutral-100" />
          )}

          {/* 빈 상태 */}
          {matchedCities.length === 0 && trimmedQuery.length >= 2 && (
            <div className="px-4 py-8 text-center">
              <p className="text-[13px] text-neutral-400">{t("noGuests")}</p>
            </div>
          )}
        </div>
      )}

      {/* ── 현재 도시 헤더 ──────────────────────────────────────── */}
      {!isSearching && (
        <div className="flex items-start justify-between px-4 pt-5 pb-1">
          <div className="flex flex-col">
            <h2 className="text-[18px] font-bold text-neutral-900 leading-tight">
              {cityLoading ? (
                <span className="text-neutral-300">···</span>
              ) : (
                currentCity
              )}
            </h2>
            <p className="text-[12px] text-neutral-400 leading-tight mt-0.5">
              {currentCountry}
            </p>
          </div>
          <Link
            href={`/city/${currentCitySlug}`}
            className="flex items-center gap-0.5 mt-1 text-[12px] text-neutral-400 hover:text-neutral-600 transition-colors active:opacity-70"
          >
            {tc("moreView")}
            <ChevronRight size={13} strokeWidth={2} />
          </Link>
        </div>
      )}

      {/* ── 피드 ──────────────────────────────────────────────── */}
      {!isSearching && (
        cityLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <p className="text-[13px] text-neutral-300">{tc("loading")}</p>
          </div>
        ) : (
          <div className="pb-6">
            {/* Upcoming Guest Artists */}
            <div className="px-4 pb-2 pt-4">
              <h3 className="text-[13px] font-semibold text-neutral-800">
                {t("guestArtists")}
              </h3>
            </div>
            {filteredGuest.length === 0 ? (
              <p className="px-4 py-4 text-[12px] text-neutral-400">{t("noGuests")}</p>
            ) : (
              <div className="space-y-2.5 px-3 pt-1">
                {filteredGuest.map(item => (
                  <FeedCard key={item.schedule.id} data={item} isLoggedIn={isLoggedIn} />
                ))}
              </div>
            )}

            {/* Based Artists */}
            <div className="px-4 pb-2 pt-5">
              <h3 className="text-[13px] font-semibold text-neutral-800">
                {t("basedArtists")}
              </h3>
            </div>
            {filteredBased.length === 0 ? (
              <p className="px-4 py-4 text-[12px] text-neutral-400">{t("noBased")}</p>
            ) : (
              <div className="space-y-2.5 px-3 pt-1">
                {filteredBased.map(item => (
                  <FeedCard key={item.schedule.id} data={item} isLoggedIn={isLoggedIn} />
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
        onToggle={handleDraftToggle}
        onReset={() => setDraftTags([])}
        onApply={() => { setAppliedTags(draftTags); setSheetOpen(false); }}
        onDismiss={() => setSheetOpen(false)}
      />
    </>
  );
}
