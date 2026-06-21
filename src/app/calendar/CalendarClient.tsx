"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Plus, MapPin } from "lucide-react";
import { CityDropdown } from "@/components/artist/CityDropdown";
import type { CityDropdownOption } from "@/components/artist/CityDropdown";

// ── 타입 ────────────────────────────────────────────────────

interface CalendarCity {
  id: string;
  name: string;
  country: string;
  countryName: string;
  region: "asia" | "europe" | "americas" | "other";
}

interface CalendarClientProps {
  /** null = 비로그인. CustomerCalendar를 표시하되 팔로우 일정 영역만 로그인 유도. */
  role: "customer" | "artist" | "admin" | null;
  cities: CalendarCity[];
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

const DEMAND_LABELS: Record<NonNullable<DemandLevel>, string> = {
  high: "여유 (1–4)",
  mid:  "보통 (5–8)",
  low:  "혼잡 (9+)",
};

// ── Customer View 달력 ──────────────────────────────────────

function CustomerCalendar({
  isGuest = false,
  cities = [],
}: {
  isGuest?: boolean;
  cities?: CalendarCity[];
}) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedCity, setSelectedCity] = useState<CalendarCity | null>(
    cities[0] ?? null
  );

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
          aria-label="이전 달"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="text-[15px] font-semibold text-neutral-900">
          {formatYearMonth(year, month)}
        </span>
        <button
          onClick={nextMonth}
          className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 transition-colors"
          aria-label="다음 달"
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
          // Sprint 5: 팔로우 아티스트 일정 점 데이터 연결 예정
          const hasSchedule = false;

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
            이번 달 일정
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
                로그인하면 일정을 볼 수 있습니다
              </p>
              <p className="text-xs text-neutral-400 leading-relaxed">
                팔로우한 아티스트의 게스트워크<br />
                일정을 달력에서 확인해보세요
              </p>
            </div>
            <Link
              href="/auth/login?next=/calendar"
              className="mt-1 rounded-xl bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white active:opacity-80"
            >
              로그인
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
                팔로우한 아티스트 일정이 없습니다
              </p>
              <p className="text-xs text-neutral-400 leading-relaxed">
                아티스트를 팔로우하면<br />
                여기서 일정을 확인할 수 있습니다
              </p>
            </div>
            <Link
              href="/"
              className="mt-1 rounded-xl bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white active:opacity-80"
            >
              아티스트 찾기
            </Link>
          </div>
        )}
      </div>

      {/* ── 범례 ─────────────────────────────────────── */}
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

// ── Artist View 달력 ────────────────────────────────────────

function ArtistCalendar({ cities }: { cities: CalendarCity[] }) {
  const today = new Date();
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
          href="/studio/schedule/new"
          className="
            flex items-center justify-center gap-2
            w-full rounded-2xl bg-neutral-900
            py-4 text-sm font-semibold text-white
            hover:opacity-90 active:opacity-80 transition-opacity
          "
        >
          <Plus size={16} aria-hidden="true" />
          Guest Work 등록
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
          aria-label="이전 달"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="text-[15px] font-semibold text-neutral-900">
          {formatYearMonth(year, month)}
        </span>
        <button
          onClick={nextMonth}
          className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 transition-colors"
          aria-label="다음 달"
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
              aria-label={`${month + 1}월 ${day}일`}
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
            {month + 1}월 {selectedDay}일 인사이트
          </p>

          {selectedDemand ? (
            <div className="mt-3 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-medium text-neutral-900">
                  Guest {DEMAND_LABELS[selectedDemand]}명
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                이 날짜의 수요 데이터를 기반으로 일정을 등록해보세요.
              </p>
            </div>
          ) : (
            <div className="mt-3">
              <p className="text-xs text-neutral-400 leading-relaxed">
                이 날짜의 수요 데이터가 아직 없습니다.
                <br />
                Guest Work를 등록하면 수요를 확인할 수 있습니다.
              </p>
              <Link
                href={`/studio/schedule/new`}
                className="
                  mt-3 flex items-center justify-center gap-1.5
                  w-full rounded-xl border border-neutral-200 bg-neutral-50
                  py-3 text-sm font-medium text-neutral-700
                  hover:border-neutral-300 hover:bg-white transition-colors
                "
              >
                <Plus size={14} aria-hidden="true" />
                이 날짜로 일정 등록
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

export function CalendarClient({ role, cities }: CalendarClientProps) {
  // null(비로그인) 또는 "customer" → CustomerCalendar
  // "artist" | "admin" → ArtistCalendar
  const isArtist = role === "artist" || role === "admin";
  // 비로그인 여부: CustomerCalendar 내 팔로우 일정 영역 로그인 유도에 사용
  const isGuest = role === null;

  return (
    <div className="flex flex-col gap-4 pb-10">
      {isArtist
        ? <ArtistCalendar cities={cities} />
        : <CustomerCalendar isGuest={isGuest} cities={cities} />
      }
    </div>
  );
}
