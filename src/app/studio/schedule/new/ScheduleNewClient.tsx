"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { ChevronLeft, ChevronRight, MapPin, Calendar, Check, Search } from "lucide-react";
import { createGuestSchedule } from "@/actions/schedule";
import type { CreateScheduleState } from "@/actions/schedule";

// ── 타입 ────────────────────────────────────────────────────

export interface CityOption {
  id: string;
  name: string;
  country: string;
  countryName: string;
  region: "asia" | "europe" | "americas" | "other";
  lat: number | null;
  lng: number | null;
}

interface ScheduleNewClientProps {
  cities: CityOption[];
  artistHandle: string | null;
}

type Step = 1 | 2 | 3 | 4 | 5;

// ── 달력 유틸 ────────────────────────────────────────────────

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}
function formatYearMonth(year: number, month: number): string {
  const names = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${names[month]} ${year}`;
}
function toDateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}
function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}
function isPastDate(year: number, month: number, day: number): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(year, month, day) < today;
}

// ── Step 진행 바 ─────────────────────────────────────────────

function StepIndicator({ step }: { step: Step }) {
  return (
    <div className="flex items-center justify-center gap-1.5 py-3">
      {([1, 2, 3, 4, 5] as Step[]).map((s) => (
        <div
          key={s}
          className={[
            "h-1.5 rounded-full transition-all duration-200",
            s === step
              ? "w-6 bg-neutral-900"
              : s < step
              ? "w-3 bg-neutral-400"
              : "w-3 bg-neutral-200",
          ].join(" ")}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

// ── Step 1: 도시 선택 ─────────────────────────────────────────

function Step1City({
  cities,
  selectedCity,
  onSelect,
  onNext,
}: {
  cities: CityOption[];
  selectedCity: CityOption | null;
  onSelect: (city: CityOption) => void;
  onNext: () => void;
}) {
  const [query, setQuery] = useState("");

  const filtered = query.trim()
    ? cities.filter(
        (c) =>
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          c.countryName.toLowerCase().includes(query.toLowerCase())
      )
    : cities;

  const grouped: Record<string, CityOption[]> = {};
  for (const c of filtered) {
    if (!grouped[c.region]) grouped[c.region] = [];
    grouped[c.region].push(c);
  }

  const regionLabels: Record<string, string> = {
    asia: "Asia", europe: "Europe", americas: "Americas", other: "Other",
  };
  const regionOrder = ["asia", "europe", "americas", "other"] as const;

  return (
    <div className="flex flex-col gap-4">
      <div className="px-4">
        <p className="text-[11px] font-semibold tracking-widest text-neutral-400 uppercase mb-1">
          Step 1
        </p>
        <h2 className="text-[17px] font-bold text-neutral-900">어느 도시로 가나요?</h2>
      </div>

      {/* 검색 */}
      <div className="px-4">
        <div className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5">
          <Search size={15} className="shrink-0 text-neutral-400" aria-hidden="true" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="도시 또는 국가 검색"
            className="flex-1 bg-transparent text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
            aria-label="도시 검색"
          />
        </div>
      </div>

      {/* 도시 목록 */}
      <div className="flex flex-col gap-4 px-4">
        {regionOrder.map((region) => {
          const list = grouped[region];
          if (!list?.length) return null;
          return (
            <div key={region}>
              <p className="mb-2 text-[10px] font-semibold tracking-widest text-neutral-400 uppercase">
                {regionLabels[region]}
              </p>
              <div className="flex flex-col gap-1">
                {list.map((city) => {
                  const isSelected = selectedCity?.id === city.id;
                  return (
                    <button
                      key={city.id}
                      onClick={() => onSelect(city)}
                      className={[
                        "flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors",
                        isSelected
                          ? "border border-neutral-900 bg-neutral-900 text-white"
                          : "border border-neutral-100 bg-white text-neutral-700 hover:border-neutral-200",
                      ].join(" ")}
                    >
                      <MapPin size={14} className={isSelected ? "text-white" : "text-neutral-400"} aria-hidden="true" />
                      <span className="flex-1 text-sm font-medium">{city.name}</span>
                      <span className={["text-[11px]", isSelected ? "text-neutral-300" : "text-neutral-400"].join(" ")}>
                        {city.countryName}
                      </span>
                      {isSelected && <Check size={14} className="text-white" aria-hidden="true" />}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-neutral-400">
            검색 결과가 없습니다
          </p>
        )}
      </div>

      {/* 다음 버튼 */}
      <div className="px-4 pb-6">
        <button
          onClick={onNext}
          disabled={!selectedCity}
          className="w-full rounded-2xl bg-neutral-900 py-4 text-sm font-semibold text-white disabled:opacity-30 disabled:cursor-not-allowed active:opacity-80 transition-opacity"
        >
          {selectedCity ? `${selectedCity.name} 선택 완료` : "도시를 선택해주세요"}
        </button>
      </div>
    </div>
  );
}

// ── Step 2: 도시 인사이트 ────────────────────────────────────

function Step2Insight({
  city,
  onNext,
  onBack,
}: {
  city: CityOption;
  onNext: () => void;
  onBack: () => void;
}) {
  // Sprint 5: city_follows (is_active=true) + guest_schedules 쿼리로 교체
  const guestCount = 0;
  const bringCount = 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="px-4">
        <p className="text-[11px] font-semibold tracking-widest text-neutral-400 uppercase mb-1">
          Step 2
        </p>
        <h2 className="text-[17px] font-bold text-neutral-900">{city.name} 현황</h2>
        <p className="text-sm text-neutral-400 mt-0.5">{city.countryName}</p>
      </div>

      {/* KPI 카드 */}
      <div className="flex gap-3 px-4">
        <div className="flex flex-1 flex-col items-center gap-0.5 rounded-2xl border border-neutral-100 bg-white py-4">
          <span className="text-[26px] font-bold text-neutral-900">{guestCount}</span>
          <span className="text-[11px] text-neutral-400">현재 Guest</span>
        </div>
        <div className="flex flex-1 flex-col items-center gap-0.5 rounded-2xl border border-neutral-100 bg-white py-4">
          <span className="text-[26px] font-bold text-neutral-900">{bringCount}</span>
          <span className="text-[11px] text-neutral-400">Bring 수요</span>
        </div>
      </div>

      {/* 안내 배너 */}
      <div className="mx-4 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3">
        <p className="text-[12px] font-medium text-blue-800">
          수요 데이터 연결 예정
        </p>
        <p className="mt-0.5 text-[11px] text-blue-600 leading-relaxed">
          Sprint 5에서 실제 Bring 수요와 Guest 현황이 연결됩니다.
          지금은 일정 등록을 계속 진행해주세요.
        </p>
      </div>

      <div className="flex gap-3 px-4 pb-6">
        <button
          onClick={onBack}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-700 active:bg-neutral-50"
          aria-label="이전 단계"
        >
          <ChevronLeft size={18} aria-hidden="true" />
        </button>
        <button
          onClick={onNext}
          className="flex-1 rounded-2xl bg-neutral-900 py-3 text-sm font-semibold text-white active:opacity-80 transition-opacity"
        >
          날짜 선택하기
        </button>
      </div>
    </div>
  );
}

// ── Step 3: 날짜 선택 ─────────────────────────────────────────

function Step3Date({
  startDate,
  endDate,
  onSelect,
  onNext,
  onBack,
}: {
  startDate: string;
  endDate: string;
  onSelect: (start: string, end: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [picking, setPicking] = useState<"start" | "end">("start");

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay   = getFirstDayOfMonth(year, month);
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  function handleDayClick(day: number) {
    if (isPastDate(year, month, day)) return;
    const dateStr = toDateStr(year, month, day);
    if (picking === "start") {
      onSelect(dateStr, "");
      setPicking("end");
    } else {
      if (startDate && dateStr < startDate) {
        onSelect(dateStr, "");
        setPicking("end");
      } else {
        onSelect(startDate, dateStr);
        setPicking("start");
      }
    }
  }

  function isInRange(day: number): boolean {
    if (!startDate || !endDate) return false;
    const d = toDateStr(year, month, day);
    return d > startDate && d < endDate;
  }
  function isStart(day: number): boolean {
    return toDateStr(year, month, day) === startDate;
  }
  function isEnd(day: number): boolean {
    return toDateStr(year, month, day) === endDate;
  }

  const canNext = !!startDate && !!endDate;

  return (
    <div className="flex flex-col gap-4">
      <div className="px-4">
        <p className="text-[11px] font-semibold tracking-widest text-neutral-400 uppercase mb-1">
          Step 3
        </p>
        <h2 className="text-[17px] font-bold text-neutral-900">날짜를 선택해주세요</h2>
      </div>

      {/* 선택 상태 */}
      <div className="flex gap-3 px-4">
        <div className={["flex flex-1 flex-col rounded-xl border px-3 py-2.5 transition-colors", picking === "start" ? "border-neutral-900 bg-neutral-50" : "border-neutral-100 bg-white"].join(" ")}>
          <span className="text-[10px] font-semibold text-neutral-400">시작일</span>
          <span className="text-[14px] font-semibold text-neutral-900">
            {startDate ? formatDisplayDate(startDate) : "—"}
          </span>
        </div>
        <div className={["flex flex-1 flex-col rounded-xl border px-3 py-2.5 transition-colors", picking === "end" ? "border-neutral-900 bg-neutral-50" : "border-neutral-100 bg-white"].join(" ")}>
          <span className="text-[10px] font-semibold text-neutral-400">종료일</span>
          <span className="text-[14px] font-semibold text-neutral-900">
            {endDate ? formatDisplayDate(endDate) : "—"}
          </span>
        </div>
      </div>

      {/* 월 이동 */}
      <div className="flex items-center justify-between px-4">
        <button
          onClick={() => { if (month === 0) { setYear(y => y - 1); setMonth(11); } else setMonth(m => m - 1); }}
          className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100"
          aria-label="이전 달"
        >
          <ChevronLeft size={18} aria-hidden="true" />
        </button>
        <span className="text-[15px] font-semibold text-neutral-900">
          {formatYearMonth(year, month)}
        </span>
        <button
          onClick={() => { if (month === 11) { setYear(y => y + 1); setMonth(0); } else setMonth(m => m + 1); }}
          className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100"
          aria-label="다음 달"
        >
          <ChevronRight size={18} aria-hidden="true" />
        </button>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 px-4">
        {["S","M","T","W","T","F","S"].map((d, i) => (
          <div key={i} className="pb-1 text-center text-[10px] font-medium text-neutral-400">{d}</div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7 px-4 gap-y-1">
        {cells.map((day, idx) => {
          if (!day) return <div key={`e-${idx}`} />;
          const past = isPastDate(year, month, day);
          const start = isStart(day);
          const end = isEnd(day);
          const inRange = isInRange(day);
          return (
            <button
              key={day}
              onClick={() => handleDayClick(day)}
              disabled={past}
              className={[
                "flex flex-col items-center py-1",
                past ? "opacity-25 cursor-not-allowed" : "cursor-pointer",
              ].join(" ")}
            >
              <span
                className={[
                  "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors",
                  start || end
                    ? "bg-neutral-900 text-white"
                    : inRange
                    ? "bg-neutral-200 text-neutral-700"
                    : "text-neutral-700 hover:bg-neutral-100",
                ].join(" ")}
              >
                {day}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex gap-3 px-4 pb-6">
        <button
          onClick={onBack}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-700 active:bg-neutral-50"
          aria-label="이전 단계"
        >
          <ChevronLeft size={18} aria-hidden="true" />
        </button>
        <button
          onClick={onNext}
          disabled={!canNext}
          className="flex-1 rounded-2xl bg-neutral-900 py-3 text-sm font-semibold text-white disabled:opacity-30 disabled:cursor-not-allowed active:opacity-80"
        >
          {canNext ? "날짜 선택 완료" : "시작일과 종료일을 선택해주세요"}
        </button>
      </div>
    </div>
  );
}

// ── Step 4: 날짜 인사이트 ────────────────────────────────────

function Step4DateInsight({
  city,
  startDate,
  endDate,
  onNext,
  onBack,
}: {
  city: CityOption;
  startDate: string;
  endDate: string;
  onNext: () => void;
  onBack: () => void;
}) {
  // Sprint 5: 선택 기간 guest_schedules 조회로 교체
  const overlapCount = 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="px-4">
        <p className="text-[11px] font-semibold tracking-widest text-neutral-400 uppercase mb-1">
          Step 4
        </p>
        <h2 className="text-[17px] font-bold text-neutral-900">기간 인사이트</h2>
        <p className="text-sm text-neutral-400 mt-0.5">
          {formatDisplayDate(startDate)} – {formatDisplayDate(endDate)}
        </p>
      </div>

      {/* 겹치는 Guest 수 */}
      <div className="mx-4 rounded-2xl border border-neutral-100 bg-white px-5 py-4">
        <p className="mb-3 text-[11px] font-semibold tracking-widest text-neutral-400 uppercase">
          {city.name} 동기간 Guest
        </p>
        <div className="flex items-end gap-2">
          <span className="text-[32px] font-bold leading-none text-neutral-900">
            {overlapCount}
          </span>
          <span className="mb-1 text-sm text-neutral-400">명의 아티스트</span>
        </div>
        <p className="mt-2 text-[11px] text-neutral-300">
          * Sprint 5에서 실데이터로 연결됩니다
        </p>
      </div>

      {/* 장르 분포 */}
      <div className="mx-4 rounded-2xl border border-neutral-100 bg-white px-5 py-4">
        <p className="mb-3 text-[11px] font-semibold tracking-widest text-neutral-400 uppercase">
          인기 장르
        </p>
        <p className="text-sm text-neutral-400">
          이 기간 장르 데이터는 Sprint 5에서 연결됩니다.
        </p>
      </div>

      <div className="flex gap-3 px-4 pb-6">
        <button
          onClick={onBack}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-700 active:bg-neutral-50"
          aria-label="이전 단계"
        >
          <ChevronLeft size={18} aria-hidden="true" />
        </button>
        <button
          onClick={onNext}
          className="flex-1 rounded-2xl bg-neutral-900 py-3 text-sm font-semibold text-white active:opacity-80"
        >
          상세 정보 입력
        </button>
      </div>
    </div>
  );
}

// ── Submit 버튼 (useFormStatus로 pending 처리) ──────────────

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex-1 rounded-2xl bg-neutral-900 py-3 text-sm font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed active:opacity-80 transition-opacity"
    >
      {pending ? "등록 중..." : "Guest Work 등록 완료"}
    </button>
  );
}

// ── Step 5: 상세 입력 + 제출 ─────────────────────────────────

function Step5Detail({
  city,
  startDate,
  endDate,
  onBack,
  artistHandle,
}: {
  city: CityOption;
  startDate: string;
  endDate: string;
  onBack: () => void;
  artistHandle: string | null;
}) {
  const initialState: CreateScheduleState = { status: "idle" };
  const [state, formAction] = useFormState(
    createGuestSchedule,
    initialState
  );
  // isPending은 SubmitButton 내부에서 useFormStatus로 처리

  return (
    <div className="flex flex-col gap-4">
      <div className="px-4">
        <p className="text-[11px] font-semibold tracking-widest text-neutral-400 uppercase mb-1">
          Step 5
        </p>
        <h2 className="text-[17px] font-bold text-neutral-900">상세 정보</h2>
      </div>

      {/* 선택 요약 */}
      <div className="mx-4 rounded-2xl border border-neutral-100 bg-neutral-50 px-4 py-3">
        <div className="flex items-center gap-2">
          <MapPin size={13} className="text-neutral-400" aria-hidden="true" />
          <span className="text-sm font-semibold text-neutral-900">{city.name}</span>
          <span className="text-[11px] text-neutral-400">{city.countryName}</span>
        </div>
        <div className="mt-1 flex items-center gap-2">
          <Calendar size={13} className="text-neutral-400" aria-hidden="true" />
          <span className="text-sm text-neutral-700">
            {formatDisplayDate(startDate)} – {formatDisplayDate(endDate)}
          </span>
        </div>
      </div>

      {/* 폼 */}
      <form action={formAction} className="flex flex-col gap-4 px-4">
        {/* hidden fields */}
        <input type="hidden" name="cityId" value={city.id} />
        <input type="hidden" name="startDate" value={startDate} />
        <input type="hidden" name="endDate" value={endDate} />

        {/* 연락 방법 */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-semibold text-neutral-700">
            연락 방법
          </label>
          <select
            name="contactType"
            defaultValue="instagram"
            className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 focus:border-neutral-400 focus:outline-none"
          >
            <option value="instagram">Instagram DM</option>
            <option value="email">Email</option>
            <option value="website">Website</option>
          </select>
        </div>

        {/* 연락처 */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-semibold text-neutral-700">
            연락처
          </label>
          <input
            type="text"
            name="contactValue"
            defaultValue={artistHandle ? `@${artistHandle}` : ""}
            placeholder="@instagram_handle 또는 email@example.com"
            className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none"
          />
        </div>

        {/* 메모 */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-semibold text-neutral-700">
            메모 <span className="font-normal text-neutral-400">(선택)</span>
          </label>
          <textarea
            name="note"
            placeholder="예약 가능 자리 수, 스튜디오 위치 등"
            rows={3}
            className="w-full resize-none rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none"
          />
        </div>

        {/* 에러 메시지 */}
        {state.status === "error" && (
          <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3">
            <p className="text-sm text-red-700">{state.message}</p>
          </div>
        )}

        {/* 버튼 행 */}
        <div className="flex gap-3 pb-6">
          <button
            type="button"
            onClick={onBack}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-700 active:bg-neutral-50"
            aria-label="이전 단계"
          >
            <ChevronLeft size={18} aria-hidden="true" />
          </button>
          <SubmitButton />
        </div>
      </form>
    </div>
  );
}

// ── 메인 Export ─────────────────────────────────────────────

export function ScheduleNewClient({
  cities,
  artistHandle,
}: ScheduleNewClientProps) {
  const [step, setStep] = useState<Step>(1);
  const [selectedCity, setSelectedCity] = useState<CityOption | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate]     = useState("");

  function handleDateSelect(start: string, end: string) {
    setStartDate(start);
    setEndDate(end);
  }

  return (
    <div className="flex flex-col">
      <StepIndicator step={step} />
      <div className="flex-1">
        {step === 1 && (
          <Step1City
            cities={cities}
            selectedCity={selectedCity}
            onSelect={setSelectedCity}
            onNext={() => setStep(2)}
          />
        )}
        {step === 2 && selectedCity && (
          <Step2Insight
            city={selectedCity}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && selectedCity && (
          <Step3Date
            startDate={startDate}
            endDate={endDate}
            onSelect={handleDateSelect}
            onNext={() => setStep(4)}
            onBack={() => setStep(2)}
          />
        )}
        {step === 4 && selectedCity && (
          <Step4DateInsight
            city={selectedCity}
            startDate={startDate}
            endDate={endDate}
            onNext={() => setStep(5)}
            onBack={() => setStep(3)}
          />
        )}
        {step === 5 && selectedCity && (
          <Step5Detail
            city={selectedCity}
            startDate={startDate}
            endDate={endDate}
            onBack={() => setStep(4)}
            artistHandle={artistHandle}
          />
        )}
      </div>
    </div>
  );
}
