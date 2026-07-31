"use client";

import { useState, useMemo } from "react";
import { usePathname } from "next/navigation";
import { useLocaleNav } from "@/lib/hooks/useLocaleNav";
import { useT } from "@/lib/hooks/useT";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Plus, MapPin } from "lucide-react";
import { CityDropdown } from "@/components/artist/CityDropdown";
import type { CityDropdownOption } from "@/components/artist/CityDropdown";
import type { CalendarScheduleItem, CityCalendarData } from "@/lib/queries/calendar";

// ── 타입 ────────────────────────────────────────────────────

interface CalendarCity {
  id: string;
  name: string;
  country: string;
  countryName: string;
  region: "asia" | "europe" | "americas" | "other";
}

interface CalendarClientProps {
  /** null = 비로그인 */
  role: "customer" | "artist" | "admin" | null;
  cities: CalendarCity[];
  artistHandle?: string | null;
  followingSchedules?: CalendarScheduleItem[];
  initialCitySchedules?: CalendarScheduleItem[];
  initialCustomerCity?: CalendarCity | null;
  initialArtistCity?: CalendarCity | null;
  initialCityData?: CityCalendarData | null;
  initialYear?: number;
  initialMonth?: number;
}

// ── 달력 계산 유틸 ──────────────────────────────────────────

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  // 0=일, 1=월, ..., 6=토 (일요일 시작)
  return new Date(year, month, 1).getDay();
}

function formatYearMonth(year: number, month: number): string {
  const monthNames = [
    "January", "February", "March", "April",
    "May", "June", "July", "August",
    "September", "October", "November", "December",
  ];
  return `${monthNames[month]} ${year}`;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

// ── 날짜별 수요 레벨 (Artist View) ──────────────────────────
// Sprint 5에서 실데이터 연결 예정
// 현재: 구조만 구현
type DemandLevel = "high" | "mid" | "low" | null;

const DEMAND_COLORS: Record<NonNullable<DemandLevel>, string> = {
  high: "bg-green-500",
  mid:  "bg-yellow-400",
  low:  "bg-red-400",
};

// DEMAND_LABELS는 ArtistCalendar 내부에서 useT로 생성

// ── Customer View 달력 ──────────────────────────────────────

function CustomerCalendar({
  isGuest = false,
  cities = [],
  followingSchedules = [],
}: {
  isGuest?: boolean;
  cities?: CalendarCity[];
  followingSchedules?: CalendarScheduleItem[];
}) {
  const tc   = useT("calendar");
  const tf   = useT("following");
  const tc_c = useT("common");
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  // 날짜별 일정 존재 여부 Set (YYYY-MM-DD 형식)
  const scheduleDateSet = useMemo(() => {
    const set = new Set<string>();
    followingSchedules.forEach((s) => {
      const start = new Date(s.startDate);
      const end   = new Date(s.endDate);
      // start~end 사이의 모든 날짜를 Set에 추가
      const cur = new Date(start);
      while (cur <= end) {
        set.add(cur.toISOString().split("T")[0]);
        cur.setDate(cur.getDate() + 1);
      }
    });
    return set;
  }, [followingSchedules]);
  const [selectedCity, setSelectedCity] = useState<CalendarCity | null>(
    cities[0] ?? null
  );
  const { href: localeHref } = useLocaleNav();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay   = getFirstDayOfMonth(year, month);

  // 달력 그리드: 빈 셀 + 날짜 셀
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  // 6주 그리드 맞추기
  while (cells.length % 7 !== 0) cells.push(null);

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* ── 도시 선택 (비로그인/Customer 모두 표시) ─── */}
      {cities.length > 0 && (
        <div className="px-4 pt-2">
          <CityDropdown
            cities={cities as CityDropdownOption[]}
            initialCityName={selectedCity?.name ?? ""}
            initialCountry={selectedCity?.country ?? ""}
            label=""
            onSelect={(option) => {
              if (!option) return;
              const full = cities.find((c) => c.id === option.id) ?? null;
              setSelectedCity(full);
            }}
            value={selectedCity as CityDropdownOption | null}
          />
        </div>
      )}

      {/* ── 월 이동 헤더 ─────────────────────────────── */}
      <div className="flex items-center justify-between px-4 pt-2">
        <button
          onClick={prevMonth}
          className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 transition-colors"
          aria-label={tc("prevMonth")}
        >
          <ChevronLeft size={18} />
        </button>
        <span className="text-[15px] font-semibold text-neutral-900">
          {formatYearMonth(year, month)}
        </span>
        <button
          onClick={nextMonth}
          className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 transition-colors"
          aria-label={tc("nextMonth")}
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* ── 요일 헤더 ─────────────────────────────────── */}
      <div className="grid grid-cols-7 px-4">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
          <div
            key={d}
            className="text-center text-[10px] font-medium text-neutral-400 pb-2"
          >
            {d}
          </div>
        ))}
      </div>

      {/* ── 날짜 그리드 ─────────────────────────────── */}
      <div className="grid grid-cols-7 px-4 gap-y-1">
        {cells.map((day, idx) => {
          if (!day) {
            return <div key={`empty-${idx}`} />;
          }
          const date = new Date(year, month, day);
          const isToday = isSameDay(date, today);
          const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const hasSchedule = scheduleDateSet.has(dateKey);

          return (
            <div key={day} className="flex flex-col items-center gap-0.5 py-1">
              <span
                className={[
                  "flex h-8 w-8 items-center justify-center rounded-full text-sm",
                  isToday
                    ? "bg-neutral-900 text-white font-semibold"
                    : "text-neutral-700",
                ].join(" ")}
              >
                {day}
              </span>
              {/* 일정 점 — Sprint 5에서 실데이터 연결 */}
              <span
                className={[
                  "h-1 w-1 rounded-full",
                  hasSchedule ? "bg-cat-purple" : "bg-transparent",
                ].join(" ")}
                aria-hidden="true"
              />
            </div>
          );
        })}
      </div>

      {/* ── 팔로우 아티스트 일정 요약 ─────────────────── */}
      <div className="mx-4 rounded-2xl border border-neutral-100 bg-white">
        <div className="border-b border-neutral-50 px-5 py-3">
          <p className="text-[11px] font-semibold tracking-widest text-neutral-400 uppercase">
            {tc("thisMonthSchedule")}
          </p>
        </div>

        {isGuest ? (
          /* 비로그인: 로그인 유도 */
          <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100">
              <MapPin size={20} className="text-neutral-400" aria-hidden="true" />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium text-neutral-700">
                {tc("loginToView")}
              </p>
              <p className="text-xs text-neutral-400 leading-relaxed">
                {tc("loginDesc")}
              </p>
            </div>
            <Link
              href="/auth/login?next=/calendar"
              className="mt-1 rounded-xl bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white active:opacity-80"
            >
              {tf("loginCta")}
            </Link>
          </div>
        ) : (
          /* 로그인: 팔로우 일정 Empty State — Sprint 5에서 실데이터로 교체 */
          <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100">
              <MapPin size={20} className="text-neutral-400" aria-hidden="true" />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium text-neutral-700">
                {tc("noFollowSchedule")}
              </p>
              <p className="text-xs text-neutral-400 leading-relaxed">
                {tc("noFollowScheduleDesc")}
              </p>
            </div>
            <Link
              href={localeHref("/")}
              className="mt-1 rounded-xl bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white active:opacity-80"
            >
              {tf("findArtistCta")}
            </Link>
          </div>
        )}
      </div>

      {/* ── 범례 ─────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-5 pb-4">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-cat-purple" aria-hidden="true" />
          <span className="text-[11px] text-neutral-400">{tc_c("hasSchedule")}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-neutral-900 text-[9px] text-white font-medium">
            {today.getDate()}
          </span>
          <span className="text-[11px] text-neutral-400">{tc_c("todayLabel")}</span>
        </div>
      </div>
    </div>
  );
}

// ── Artist View 달력 ────────────────────────────────────────

function ArtistCalendar({
  cities,
  artistHandle,
}: {
  cities: CalendarCity[];
  artistHandle?: string | null;
}) {
  const tc         = useT("calendar");
  const ta         = useT("artist");
  const DEMAND_LABELS: Record<NonNullable<DemandLevel>, string> = {
    high: tc("demandHigh"),
    mid:  tc("demandMid"),
    low:  tc("demandLow"),
  };
  const today = new Date();
  const pathname = usePathname();
  const lp = pathname === "/ko" || pathname.startsWith("/ko/") ? "/ko" : "";
  const scheduleNewPath = artistHandle
    ? `${lp}/artists/${artistHandle}/schedule/new`
    : `${lp}/artists/new`;
  const [year, setYear]           = useState(today.getFullYear());
  const [month, setMonth]         = useState(today.getMonth());
  const [selectedCity, setSelectedCity] = useState<CalendarCity | null>(
    cities[0] ?? null
  );
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay   = getFirstDayOfMonth(year, month);

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  }

  // Sprint 5에서 실데이터 연결 예정
  // 현재: 날짜별 수요 레벨 mock (구조 확인용)
  function getDemandLevel(): DemandLevel {
    return null;
  }

  const selectedDemand = selectedDay ? getDemandLevel() : null;

  return (
    <div className="flex flex-col gap-4">
      {/* ── Guest Work 등록 CTA ───────────────────────── */}
      <div className="mx-4 mt-2">
        <Link
          href={scheduleNewPath}
          className="
            flex items-center justify-center gap-2
            w-full rounded-2xl bg-neutral-900
            py-4 text-sm font-semibold text-white
            hover:opacity-90 active:opacity-80 transition-opacity
          "
        >
          <Plus size={16} aria-hidden="true" />
          {ta("addSchedule")}
        </Link>
      </div>

      {/* ── 도시 선택 — CityDropdown 컴포넌트 통일 ──── */}
      <div className="px-4">
        <CityDropdown
          cities={cities as CityDropdownOption[]}
          initialCityName={selectedCity?.name ?? ""}
          initialCountry={selectedCity?.country ?? ""}
          label=""
          onSelect={(option) => {
            if (!option) return;
            const full = cities.find((c) => c.id === option.id) ?? null;
            setSelectedCity(full);
            setSelectedDay(null);
          }}
          value={selectedCity as CityDropdownOption | null}
        />
      </div>

      {/* ── 월 이동 헤더 ─────────────────────────────── */}
      <div className="flex items-center justify-between px-4">
        <button
          onClick={prevMonth}
          className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 transition-colors"
          aria-label={tc("prevMonth")}
        >
          <ChevronLeft size={18} />
        </button>
        <span className="text-[15px] font-semibold text-neutral-900">
          {formatYearMonth(year, month)}
        </span>
        <button
          onClick={nextMonth}
          className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 transition-colors"
          aria-label={tc("nextMonth")}
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* ── 요일 헤더 ─────────────────────────────────── */}
      <div className="grid grid-cols-7 px-4">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
          <div
            key={d}
            className="text-center text-[10px] font-medium text-neutral-400 pb-2"
          >
            {d}
          </div>
        ))}
      </div>

      {/* ── 날짜 그리드 + 수요 인디케이터 ───────────── */}
      <div className="grid grid-cols-7 px-4 gap-y-1">
        {cells.map((day, idx) => {
          if (!day) {
            return <div key={`empty-${idx}`} />;
          }
          const date = new Date(year, month, day);
          const isToday     = isSameDay(date, today);
          const isSelected  = selectedDay === day;
          const demand      = getDemandLevel();
          const isPast      = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());

          return (
            <button
              key={day}
              onClick={() => setSelectedDay(isSelected ? null : day)}
              className="flex flex-col items-center gap-0.5 py-1"
              aria-label={`${month + 1}/${day}`}
              aria-pressed={isSelected}
            >
              <span
                className={[
                  "flex h-8 w-8 items-center justify-center rounded-full text-sm transition-colors",
                  isSelected
                    ? "bg-neutral-900 text-white font-semibold"
                    : isToday
                    ? "border border-neutral-900 text-neutral-900 font-semibold"
                    : isPast
                    ? "text-neutral-300"
                    : "text-neutral-700 hover:bg-neutral-100",
                ].join(" ")}
              >
                {day}
              </span>
              {/* 수요 인디케이터 dot — Sprint 5에서 실데이터 연결 */}
              {demand && !isPast ? (
                <span
                  className={`h-1.5 w-1.5 rounded-full ${DEMAND_COLORS[demand]}`}
                  aria-hidden="true"
                />
              ) : (
                <span className="h-1.5 w-1.5" aria-hidden="true" />
              )}
            </button>
          );
        })}
      </div>

      {/* ── 날짜 선택 인사이트 패널 ─────────────────── */}
      {selectedDay && (
        <div className="mx-4 rounded-2xl border border-neutral-100 bg-white px-5 py-4">
          <p className="text-[13px] font-semibold text-neutral-900">
            {tc("dateInsight").replace("{month}", String(month + 1)).replace("{day}", String(selectedDay))}
          </p>

          {selectedDemand ? (
            <div className="mt-3 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-medium text-neutral-900">
                  {tc("guestCountLabel").replace("{label}", DEMAND_LABELS[selectedDemand!])}
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                {tc("noInsightDesc")}
              </p>
            </div>
          ) : (
            <div className="mt-3">
              <p className="text-xs text-neutral-400 leading-relaxed">
                {tc("noInsight")}
                <br />
                {tc("noInsightDesc")}
              </p>
              <Link
                href={scheduleNewPath}
                className="
                  mt-3 flex items-center justify-center gap-1.5
                  w-full rounded-xl border border-neutral-200 bg-neutral-50
                  py-3 text-sm font-medium text-neutral-700
                  hover:border-neutral-300 hover:bg-white transition-colors
                "
              >
                <Plus size={14} aria-hidden="true" />
                {tc("addScheduleForDate")}
              </Link>
            </div>
          )}
        </div>
      )}

      {/* ── 수요 레벨 범례 ───────────────────────────── */}
      <div className="mx-4 rounded-2xl border border-neutral-100 bg-white px-4 py-3">
        <div className="flex items-center gap-5">
          {(["high", "mid", "low"] as const).map(level => (
            <div key={level} className="flex items-center gap-1.5">
              <span
                className={`block h-2 w-2 rounded-full ${DEMAND_COLORS[level]}`}
                aria-hidden="true"
              />
              <span className="text-[11px] text-neutral-600">
                {DEMAND_LABELS[level]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── 메인 Export ─────────────────────────────────────────────

export function CalendarClient({ role, cities, artistHandle, followingSchedules }: CalendarClientProps) {
  const isArtist = role === "artist" || role === "admin";
  const isGuest  = role === null;

  return (
    <div className="flex flex-col gap-4 pb-10">
      {isArtist
        ? <ArtistCalendar cities={cities} artistHandle={artistHandle} />
        : <CustomerCalendar isGuest={isGuest} cities={cities} followingSchedules={followingSchedules} />
      }
    </div>
  );
}
