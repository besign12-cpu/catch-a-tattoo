"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Plus, MapPin } from "lucide-react";
import { CityDropdown } from "@/components/artist/CityDropdown";
import type { CityDropdownOption } from "@/components/artist/CityDropdown";
import { useAnalytics } from "@/lib/hooks/useAnalytics";
import { useT } from "@/lib/hooks/useT";
import type { CalendarScheduleItem, CityCalendarData } from "@/lib/queries/calendar";

// ── 타입 ─────────────────────────────────────────────────────

interface CalendarCity {
  id: string;
  name: string;
  country: string;
  countryName: string;
  region: "asia" | "europe" | "americas" | "other";
}

interface CalendarClientProps {
  role: "customer" | "artist" | "admin" | null;
  cities: CalendarCity[];
  artistHandle: string | null;
  followingSchedules: CalendarScheduleItem[];
  initialCitySchedules: CalendarScheduleItem[];
  initialCustomerCity: CalendarCity | null;
  initialArtistCity: CalendarCity | null;
  initialCityData: CityCalendarData | null;
  initialYear: number;
  initialMonth: number;
}

// ── 달력 계산 유틸 ────────────────────────────────────────────

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}
function formatYearMonth(year: number, month: number) {
  const names = ["January","February","March","April","May","June",
    "July","August","September","October","November","December"];
  return `${names[month]} ${year}`;
}
function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}
function dateInRange(date: Date, startStr: string, endStr: string) {
  const start = new Date(startStr);
  const end   = new Date(endStr);
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);
  return date >= start && date <= end;
}

// ── 날짜별 일정 맵 생성 ───────────────────────────────────────

function buildScheduleMap(
  schedules: CalendarScheduleItem[],
  year: number,
  month: number
): Map<number, CalendarScheduleItem[]> {
  const map = new Map<number, CalendarScheduleItem[]>();
  const daysInMonth = getDaysInMonth(year, month);

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const daySchedules = schedules.filter((s) =>
      dateInRange(date, s.startDate, s.endDate)
    );
    if (daySchedules.length > 0) map.set(day, daySchedules);
  }
  return map;
}

// ── 수요 레벨 (Artist View) ───────────────────────────────────

type DemandLevel = "high" | "mid" | "low" | null;
const DEMAND_COLORS: Record<NonNullable<DemandLevel>, string> = {
  high: "bg-green-500", mid: "bg-yellow-400", low: "bg-red-400",
};
function getDemandLabels(t: (k: string) => string): Record<NonNullable<DemandLevel>, string> {
  return {
    high: t("demandHigh"),
    mid:  t("demandMid"),
    low:  t("demandLow"),
  };
}
function guestCountToLevel(count: number): DemandLevel {
  if (count === 0) return null;
  if (count <= 4)  return "high";
  if (count <= 8)  return "mid";
  return "low";
}

// ── Customer Calendar ─────────────────────────────────────────

function CustomerCalendar({
  isGuest,
  cities,
  followingSchedules,
  initialCitySchedules,
  initialCustomerCity,
  initialYear,
  initialMonth,
}: {
  isGuest: boolean;
  cities: CalendarCity[];
  followingSchedules: CalendarScheduleItem[];
  initialCitySchedules: CalendarScheduleItem[];
  initialCustomerCity: CalendarCity | null;
  initialYear: number;
  initialMonth: number;
}) {
  const today = new Date();
  const [year, setYear]   = useState(initialYear);
  const [month, setMonth] = useState(initialMonth);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [monthSchedules, setMonthSchedules] = useState<CalendarScheduleItem[]>(followingSchedules);
  // 도시 탐색용 state — 서버에서 결정된 객체 사용 (cities[0] fallback 없음)
  const [selectedCity, setSelectedCity] = useState<CalendarCity | null>(
    initialCustomerCity
  );
  const [citySchedules, setCitySchedules] = useState<CalendarScheduleItem[]>(initialCitySchedules);
  const [loading, setLoading] = useState(false);
  const [cityLoading, setCityLoading] = useState(false);

  // 탭: "following"(팔로우 일정) | "city"(도시 탐색)
  const [viewMode, setViewMode] = useState<"following" | "city">("city");

  const tc   = useT("calendar");
  const tc_c = useT("common");

  const { trackCityClick } = useAnalytics();

  // 현재 표시할 일정 (viewMode에 따라)
  const activeSchedules = viewMode === "following" ? monthSchedules : citySchedules;

  // 월 변경 시 팔로우 일정 재조회
  useEffect(() => {
    if (isGuest || viewMode !== "following") return;
    setLoading(true);
    fetch(`/api/calendar/following?year=${year}&month=${month}`)
      .then(res => res.ok ? res.json() : [])
      .then(data => setMonthSchedules(Array.isArray(data) ? data : []))
      .catch(() => setMonthSchedules([]))
      .finally(() => setLoading(false));
  }, [year, month, isGuest, viewMode]);

  // 월/도시 변경 시 도시 일정 재조회
  useEffect(() => {
    if (!selectedCity || viewMode !== "city") return;
    setCityLoading(true);
    fetch(`/api/calendar/city-schedules?city=${encodeURIComponent(selectedCity.name)}&year=${year}&month=${month}`)
      .then(res => res.ok ? res.json() : [])
      .then(data => setCitySchedules(Array.isArray(data) ? data : []))
      .catch(() => setCitySchedules([]))
      .finally(() => setCityLoading(false));
  }, [year, month, selectedCity, viewMode]);

  const scheduleMap = buildScheduleMap(activeSchedules, year, month);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay    = getFirstDayOfMonth(year, month);
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  function prevMonth() {
    setSelectedDay(null);
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    setSelectedDay(null);
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  }

  // 정렬된 전체 일정 (리스트용)
  const allMonthSchedules = [...activeSchedules].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

  const isLoadingAny = loading || cityLoading;
  const selectedSchedules = selectedDay ? (scheduleMap.get(selectedDay) ?? []) : [];

  return (
    <div className="flex flex-col gap-4">
      {/* viewMode 토글 — 팔로우 일정 | 도시 탐색 */}
      {!isGuest && (
        <div className="mx-4 mt-2 flex rounded-xl border border-neutral-100 bg-neutral-50 p-1">
          {(["city", "following"] as const).map(mode => (
            <button
              key={mode}
              onClick={() => { setViewMode(mode); setSelectedDay(null); }}
              className={[
                "flex-1 rounded-lg py-2 text-[12px] font-medium transition-colors",
                viewMode === mode
                  ? "bg-white text-neutral-900 shadow-sm"
                  : "text-neutral-400",
              ].join(" ")}
            >
              {mode === "city" ? tc("cityExplore") : tc("followingSchedule")}
            </button>
          ))}
        </div>
      )}

      {/* 도시 탐색 모드: CityDropdown */}
      {viewMode === "city" && cities.length > 0 && (
        <div className="px-4">
          <CityDropdown
            cities={cities as CityDropdownOption[]}
            initialCityName={selectedCity?.name ?? ""}
            initialCountry={selectedCity?.country ?? ""}
            label=""
            onSelect={(option) => {
              if (!option) return;
              const full = cities.find(c => c.id === option.id) ?? null;
              setSelectedCity(full);
              setSelectedDay(null);
              if (full) trackCityClick(full.name);
            }}
            value={selectedCity as CityDropdownOption | null}
          />
        </div>
      )}

      {/* 월 이동 헤더 */}
      <div className="flex items-center justify-between px-4">
        <button onClick={prevMonth}
          className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100"
          aria-label="이전 달">
          <ChevronLeft size={18} />
        </button>
        <span className="text-[15px] font-semibold text-neutral-900">
          {formatYearMonth(year, month)}
          {isLoadingAny && <span className="ml-2 text-xs text-neutral-300">···</span>}
        </span>
        <button onClick={nextMonth}
          className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100"
          aria-label="다음 달">
          <ChevronRight size={18} />
        </button>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 px-4">
        {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
          <div key={d} className="text-center text-[10px] font-medium text-neutral-400 pb-2">{d}</div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7 px-4 gap-y-1">
        {cells.map((day, idx) => {
          if (!day) return <div key={`empty-${idx}`} />;
          const date = new Date(year, month, day);
          const isToday   = isSameDay(date, today);
          const isSelected = selectedDay === day;
          const hasSchedule = scheduleMap.has(day);

          return (
            <button
              key={day}
              onClick={() => !isGuest && setSelectedDay(isSelected ? null : day)}
              className="flex flex-col items-center gap-0.5 py-1"
              aria-label={`${month + 1}월 ${day}일`}
              aria-pressed={isSelected}
            >
              <span className={[
                "flex h-8 w-8 items-center justify-center rounded-full text-sm transition-colors",
                isSelected ? "bg-neutral-900 text-white font-semibold"
                : isToday  ? "bg-neutral-900 text-white font-semibold"
                : "text-neutral-700",
              ].join(" ")}>{day}</span>
              <span
                className={["h-1 w-1 rounded-full",
                  hasSchedule ? "bg-cat-purple" : "bg-transparent",
                ].join(" ")}
                aria-hidden="true"
              />
            </button>
          );
        })}
      </div>

      {/* 선택 날짜 일정 목록 */}
      {selectedDay && selectedSchedules.length > 0 && (
        <div className="mx-4 flex flex-col gap-2 rounded-2xl border border-neutral-100 bg-white px-4 py-4">
          <p className="text-[11px] font-semibold tracking-widest text-neutral-400 uppercase">
            {month + 1}월 {selectedDay}일
          </p>
          {selectedSchedules.map(s => (
            <Link key={s.id} href={`/artists/${s.artistHandle}`}
              className="flex items-center gap-3 rounded-xl border border-neutral-100 px-3 py-2.5 hover:border-neutral-200 transition-colors">
              <MapPin size={14} className="shrink-0 text-cat-purple" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium text-neutral-900 leading-tight truncate">
                  {s.artistName}
                </p>
                <p className="text-[11px] text-neutral-400 leading-tight">
                  {s.city} · {new Date(s.startDate).toLocaleDateString("ko-KR", { month: "numeric", day: "numeric" })} –{" "}
                  {new Date(s.endDate).toLocaleDateString("ko-KR", { month: "numeric", day: "numeric" })}
                </p>
              </div>
              <ChevronRight size={14} className="shrink-0 text-neutral-300" aria-hidden="true" />
            </Link>
          ))}
        </div>
      )}

      {/* 이번 달 일정 전체 */}
      <div className="mx-4 rounded-2xl border border-neutral-100 bg-white">
        <div className="border-b border-neutral-50 px-5 py-3">
          <p className="text-[11px] font-semibold tracking-widest text-neutral-400 uppercase">
            {viewMode === "city" && selectedCity
              ? `${selectedCity.name} Guest Work`
              : tc("followingArtistSchedule")}
          </p>
        </div>

        {isGuest ? (
          <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100">
              <MapPin size={20} className="text-neutral-400" aria-hidden="true" />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium text-neutral-700">{tc("loginToView")}</p>
              <p className="text-xs text-neutral-400 leading-relaxed">
                {tc("loginDesc")}
              </p>
            </div>
            <Link href="/auth/login?next=/calendar"
              className="mt-1 rounded-xl bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white active:opacity-80">
              로그인
            </Link>
          </div>
        ) : allMonthSchedules.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100">
              <MapPin size={20} className="text-neutral-400" aria-hidden="true" />
            </div>
            <p className="text-sm font-medium text-neutral-700">
              {viewMode === "city"
                ? tc("noCitySchedule", { city: selectedCity?.name ?? "" })
                : tc("noFollowSchedule")}
            </p>
            <p className="text-xs text-neutral-400 leading-relaxed">
              {viewMode === "city"
                ? tc("noCityScheduleDesc")
                : tc("noFollowScheduleDesc")}
            </p>
            {viewMode === "following" && (
              <Link href="/"
                className="mt-1 rounded-xl bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white active:opacity-80">
                {tc_c("findArtist")}
              </Link>
            )}
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-neutral-50">
            {allMonthSchedules.map(s => (
              <Link key={s.id} href={`/artists/${s.artistHandle}`}
                className="flex items-center gap-3 px-5 py-3 hover:bg-neutral-50 transition-colors">
                <MapPin size={14} className="shrink-0 text-cat-purple" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium text-neutral-900 truncate">{s.artistName}</p>
                  <p className="text-[11px] text-neutral-400">
                    {s.city} · {new Date(s.startDate).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })}
                    {" "}–{" "}
                    {new Date(s.endDate).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })}
                  </p>
                </div>
                <ChevronRight size={14} className="shrink-0 text-neutral-300" aria-hidden="true" />
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* 범례 */}
      <div className="flex items-center gap-3 px-5 pb-4">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-cat-purple" aria-hidden="true" />
          <span className="text-[11px] text-neutral-400">일정 있음</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-neutral-900 text-[9px] text-white font-medium">
            {today.getDate()}
          </span>
          <span className="text-[11px] text-neutral-400">오늘</span>
        </div>
      </div>
    </div>
  );
}

// ── Artist Calendar ───────────────────────────────────────────

function ArtistCalendar({
  cities,
  artistHandle,
  initialCityData,
  initialArtistCity,
  followingSchedules,
  initialYear,
  initialMonth,
}: {
  cities: CalendarCity[];
  artistHandle: string | null;
  initialCityData: CityCalendarData | null;
  initialArtistCity: CalendarCity | null;
  followingSchedules: CalendarScheduleItem[];
  initialYear: number;
  initialMonth: number;
}) {
  const today = new Date();
  const [year, setYear]     = useState(initialYear);
  const [month, setMonth]   = useState(initialMonth);
  const [selectedCity, setSelectedCity] = useState<CalendarCity | null>(initialArtistCity);
  const [selectedDay, setSelectedDay]   = useState<number | null>(null);
  const [cityData, setCityData]         = useState<CityCalendarData | null>(initialCityData);
  const [loadingCity, setLoadingCity]   = useState(false);

  // viewMode: "city"(도시 탐색) | "following"(팔로우 일정)
  const [viewMode, setViewMode] = useState<"city" | "following">("city");

  // 팔로우 일정 state (Customer와 동일 로직)
  const [monthSchedules, setMonthSchedules] = useState<CalendarScheduleItem[]>(followingSchedules);
  const [loadingFollowing, setLoadingFollowing] = useState(false);

  const calPathname = usePathname();
  const calLocale = calPathname === "/ko" || calPathname.startsWith("/ko/") ? "ko" : "en";
  const localePrefix = calLocale === "ko" ? "/ko" : "";
  const scheduleNewPath = artistHandle
    ? `${localePrefix}/artists/${artistHandle}/schedule/new`
    : `${localePrefix}/artists/new`;

  const ta   = useT("calendar");
  const ta_c = useT("common");
  const ta_d = useT("discover");
  const DEMAND_LABELS = getDemandLabels(ta);

  const { trackCityClick } = useAnalytics();

  // 도시 변경 시 KPI 재조회
  const fetchCityData = useCallback(async (cityName: string) => {
    setLoadingCity(true);
    try {
      const res = await fetch(`/api/calendar/city?city=${encodeURIComponent(cityName)}`);
      if (res.ok) setCityData(await res.json());
    } catch { /* silent */ }
    finally { setLoadingCity(false); }
  }, []);

  // 월 변경 시 팔로우 일정 재조회 (following 탭에서만)
  useEffect(() => {
    if (viewMode !== "following") return;
    setLoadingFollowing(true);
    fetch(`/api/calendar/following?year=${year}&month=${month}`)
      .then(res => res.ok ? res.json() : [])
      .then(data => setMonthSchedules(Array.isArray(data) ? data : []))
      .catch(() => setMonthSchedules([]))
      .finally(() => setLoadingFollowing(false));
  }, [year, month, viewMode]);

  function prevMonth() {
    setSelectedDay(null);
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    setSelectedDay(null);
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  }

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay    = getFirstDayOfMonth(year, month);
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const demandLevel = guestCountToLevel(cityData?.guestCount ?? 0);

  // 팔로우 탭: 날짜별 일정 맵
  const followingScheduleMap = buildScheduleMap(monthSchedules, year, month);
  const selectedFollowingSchedules = selectedDay
    ? (followingScheduleMap.get(selectedDay) ?? [])
    : [];
  const allFollowingSchedules = [...monthSchedules].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

  return (
    <div className="flex flex-col gap-4">

      {/* ── 상단 탭: 도시 탐색 | 팔로우 일정 ──────────── */}
      <div className="mx-4 mt-2 flex rounded-xl border border-neutral-100 bg-neutral-50 p-1">
        {(["city", "following"] as const).map(mode => (
          <button
            key={mode}
            onClick={() => { setViewMode(mode); setSelectedDay(null); }}
            className={[
              "flex-1 rounded-lg py-2 text-[12px] font-medium transition-colors",
              viewMode === mode
                ? "bg-white text-neutral-900 shadow-sm"
                : "text-neutral-400",
            ].join(" ")}
          >
            {mode === "city" ? ta("cityExplore") : ta("followingSchedule")}
          </button>
        ))}
      </div>

      {/* ── 도시 탐색 탭 ──────────────────────────────── */}
      {viewMode === "city" && (
        <>
          {/* Guest Work 등록 CTA */}
          <div className="mx-4">
            <Link href={scheduleNewPath}
              className="flex items-center justify-center gap-2 w-full rounded-2xl bg-neutral-900 py-4 text-sm font-semibold text-white hover:opacity-90 active:opacity-80 transition-opacity">
              <Plus size={16} aria-hidden="true" />
              {ta_d("addGuestWork")}
            </Link>
          </div>

          {/* 도시 KPI */}
          {cityData && (
            <div className="mx-4 grid grid-cols-3 gap-2">
              {[
                { label: "Guest", value: cityData.guestCount },
                { label: "Based", value: cityData.basedCount },
                { label: "Bring", value: cityData.bringCount },
              ].map(({ label, value }) => (
                <div key={label} className="flex flex-col items-center rounded-2xl border border-neutral-100 bg-white py-3">
                  <span className="text-lg font-bold text-neutral-900">{loadingCity ? "···" : value}</span>
                  <span className="text-[10px] text-neutral-400">{label}</span>
                </div>
              ))}
            </div>
          )}

          {/* 도시 선택 */}
          <div className="px-4">
            <CityDropdown
              cities={cities as CityDropdownOption[]}
              initialCityName={selectedCity?.name ?? ""}
              initialCountry={selectedCity?.country ?? ""}
              label=""
              onSelect={(option) => {
                if (!option) return;
                const full = cities.find(c => c.id === option.id) ?? null;
                setSelectedCity(full);
                setSelectedDay(null);
                if (full) {
                  fetchCityData(full.name);
                  trackCityClick(full.name);
                }
              }}
              value={selectedCity as CityDropdownOption | null}
            />
          </div>
        </>
      )}

      {/* ── 공통: 월 이동 헤더 ────────────────────────── */}
      <div className="flex items-center justify-between px-4">
        <button onClick={prevMonth}
          className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100"
          aria-label="이전 달">
          <ChevronLeft size={18} />
        </button>
        <span className="text-[15px] font-semibold text-neutral-900">
          {formatYearMonth(year, month)}
          {(loadingCity || loadingFollowing) && (
            <span className="ml-2 text-xs text-neutral-300">···</span>
          )}
        </span>
        <button onClick={nextMonth}
          className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100"
          aria-label="다음 달">
          <ChevronRight size={18} />
        </button>
      </div>

      {/* ── 요일 헤더 ─────────────────────────────────── */}
      <div className="grid grid-cols-7 px-4">
        {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
          <div key={d} className="text-center text-[10px] font-medium text-neutral-400 pb-2">{d}</div>
        ))}
      </div>

      {/* ── 날짜 그리드 ───────────────────────────────── */}
      <div className="grid grid-cols-7 px-4 gap-y-1">
        {cells.map((day, idx) => {
          if (!day) return <div key={`empty-${idx}`} />;
          const date       = new Date(year, month, day);
          const isToday    = isSameDay(date, today);
          const isSelected = selectedDay === day;
          const isPast     = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
          const hasFollowingSchedule = viewMode === "following" && followingScheduleMap.has(day);

          return (
            <button key={day}
              onClick={() => setSelectedDay(isSelected ? null : day)}
              className="flex flex-col items-center gap-0.5 py-1"
              aria-label={`${month + 1}월 ${day}일`}
              aria-pressed={isSelected}>
              <span className={[
                "flex h-8 w-8 items-center justify-center rounded-full text-sm transition-colors",
                isSelected ? "bg-neutral-900 text-white font-semibold"
                : isToday  ? "border border-neutral-900 text-neutral-900 font-semibold"
                : isPast   ? "text-neutral-300"
                : "text-neutral-700 hover:bg-neutral-100",
              ].join(" ")}>{day}</span>
              {/* 도시 탐색: 수요 인디케이터 / 팔로우: 일정 점 */}
              {viewMode === "city" && demandLevel && !isPast ? (
                <span className={`h-1.5 w-1.5 rounded-full ${DEMAND_COLORS[demandLevel]}`} aria-hidden="true" />
              ) : viewMode === "following" && hasFollowingSchedule ? (
                <span className="h-1 w-1 rounded-full bg-cat-purple" aria-hidden="true" />
              ) : (
                <span className="h-1.5 w-1.5" aria-hidden="true" />
              )}
            </button>
          );
        })}
      </div>

      {/* ── 도시 탐색 탭: 날짜 인사이트 패널 ─────────── */}
      {viewMode === "city" && selectedDay && (
        <div className="mx-4 rounded-2xl border border-neutral-100 bg-white px-5 py-4">
          <p className="text-[13px] font-semibold text-neutral-900">
            {ta("dateInsight", { month: month + 1, day: selectedDay })}
          </p>
          {demandLevel ? (
            <div className="mt-3 flex flex-col gap-2">
              <p className="text-[13px] font-medium text-neutral-900">
                Guest {DEMAND_LABELS[demandLevel]}
              </p>
              <p className="text-xs text-neutral-400">이 날짜의 수요를 기반으로 일정을 등록해보세요.</p>
            </div>
          ) : (
            <div className="mt-3">
              <p className="text-xs text-neutral-400 leading-relaxed">
                {ta("noInsight")}<br />
                {ta("noInsightDesc")}
              </p>
              <Link href={scheduleNewPath}
                className="mt-3 flex items-center justify-center gap-1.5 w-full rounded-xl border border-neutral-200 bg-neutral-50 py-3 text-sm font-medium text-neutral-700 hover:border-neutral-300 hover:bg-white transition-colors">
                <Plus size={14} aria-hidden="true" />
                {ta("addScheduleForDate")}
              </Link>
            </div>
          )}
        </div>
      )}

      {/* ── 팔로우 탭: 날짜 클릭 일정 목록 ──────────── */}
      {viewMode === "following" && selectedDay && selectedFollowingSchedules.length > 0 && (
        <div className="mx-4 flex flex-col gap-2 rounded-2xl border border-neutral-100 bg-white px-4 py-4">
          <p className="text-[11px] font-semibold tracking-widest text-neutral-400 uppercase">
            {month + 1}월 {selectedDay}일
          </p>
          {selectedFollowingSchedules.map(s => (
            <Link key={s.id} href={`/artists/${s.artistHandle}`}
              className="flex items-center gap-3 rounded-xl border border-neutral-100 px-3 py-2.5 hover:border-neutral-200 transition-colors">
              <MapPin size={14} className="shrink-0 text-cat-purple" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium text-neutral-900 leading-tight truncate">{s.artistName}</p>
                <p className="text-[11px] text-neutral-400 leading-tight">
                  {s.city} · {new Date(s.startDate).toLocaleDateString("ko-KR", { month: "numeric", day: "numeric" })} –{" "}
                  {new Date(s.endDate).toLocaleDateString("ko-KR", { month: "numeric", day: "numeric" })}
                </p>
              </div>
              <ChevronRight size={14} className="shrink-0 text-neutral-300" aria-hidden="true" />
            </Link>
          ))}
        </div>
      )}

      {/* ── 도시 탐색 탭: 인기 스타일 ────────────────── */}
      {viewMode === "city" && cityData && cityData.topStyles.length > 0 && (
        <div className="mx-4 rounded-2xl border border-neutral-100 bg-white px-5 py-4">
          <p className="mb-3 text-[11px] font-semibold tracking-widest text-neutral-400 uppercase">
            인기 스타일 in {selectedCity?.name}
          </p>
          <div className="flex flex-wrap gap-2">
            {cityData.topStyles.map(s => (
              <span key={s.name}
                className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-[12px] font-medium text-neutral-700">
                {s.name}
                <span className="ml-1.5 text-neutral-400 text-[11px]">{s.count}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── 팔로우 탭: 이번 달 전체 팔로우 일정 ──────── */}
      {viewMode === "following" && (
        <div className="mx-4 rounded-2xl border border-neutral-100 bg-white">
          <div className="border-b border-neutral-50 px-5 py-3">
            <p className="text-[11px] font-semibold tracking-widest text-neutral-400 uppercase">
              {ta("followingArtistSchedule")}
            </p>
          </div>
          {allFollowingSchedules.length === 0 ? (
            <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100">
                <MapPin size={20} className="text-neutral-400" aria-hidden="true" />
              </div>
              <p className="text-sm font-medium text-neutral-700">{ta("noFollowSchedule")}</p>
              <p className="text-xs text-neutral-400 leading-relaxed">
                {ta("noFollowScheduleDesc")}
              </p>
              <Link href="/"
                className="mt-1 rounded-xl bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white active:opacity-80">
                {ta_c("findArtist")}
              </Link>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-neutral-50">
              {allFollowingSchedules.map(s => (
                <Link key={s.id} href={`/artists/${s.artistHandle}`}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-neutral-50 transition-colors">
                  <MapPin size={14} className="shrink-0 text-cat-purple" aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium text-neutral-900 truncate">{s.artistName}</p>
                    <p className="text-[11px] text-neutral-400">
                      {s.city} · {new Date(s.startDate).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })}
                      {" "}–{" "}
                      {new Date(s.endDate).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })}
                    </p>
                  </div>
                  <ChevronRight size={14} className="shrink-0 text-neutral-300" aria-hidden="true" />
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── 도시 탐색 탭: 수요 레벨 범례 ────────────── */}
      {viewMode === "city" && (
        <div className="mx-4 rounded-2xl border border-neutral-100 bg-white px-4 py-3">
          <div className="flex items-center gap-5">
            {(["high","mid","low"] as const).map(level => (
              <div key={level} className="flex items-center gap-1.5">
                <span className={`block h-2 w-2 rounded-full ${DEMAND_COLORS[level]}`} aria-hidden="true" />
                <span className="text-[11px] text-neutral-600">{DEMAND_LABELS[level]}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
export function CalendarClient({
  role,
  cities,
  artistHandle,
  followingSchedules,
  initialCitySchedules,
  initialCustomerCity,
  initialArtistCity,
  initialCityData,
  initialYear,
  initialMonth,
}: CalendarClientProps) {
  const isArtist = role === "artist" || role === "admin";
  const isGuest  = role === null;

  return (
    <div className="flex flex-col gap-4 pb-10">
      {isArtist ? (
        <ArtistCalendar
          cities={cities}
          artistHandle={artistHandle}
          initialCityData={initialCityData}
          initialArtistCity={initialArtistCity}
          followingSchedules={followingSchedules}
          initialYear={initialYear}
          initialMonth={initialMonth}
        />
      ) : (
        <CustomerCalendar
          isGuest={isGuest}
          cities={cities}
          followingSchedules={followingSchedules}
          initialCitySchedules={initialCitySchedules}
          initialCustomerCity={initialCustomerCity}
          initialYear={initialYear}
          initialMonth={initialMonth}
        />
      )}
    </div>
  );
}
