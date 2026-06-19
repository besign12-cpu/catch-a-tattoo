"use client";

import { useState } from "react";
import { Search, Check, ChevronDown, MapPin } from "lucide-react";

// ── 타입 ────────────────────────────────────────────────────

export interface CityDropdownOption {
  id: string;
  name: string;
  country: string;   // 2자리 코드 (KR, JP...)
  countryName: string;
  region: "asia" | "europe" | "americas" | "other";
}

interface CityDropdownProps {
  cities: CityDropdownOption[];
  /** 현재 선택된 도시명 (수정 폼에서 초기값) */
  initialCityName?: string;
  /** 현재 선택된 국가코드 (수정 폼에서 초기값) */
  initialCountry?: string;
  required?: boolean;
  label?: string;
  hint?: string;
}

// ── 지역 레이블 ──────────────────────────────────────────────

const REGION_LABELS: Record<string, string> = {
  asia: "Asia",
  europe: "Europe",
  americas: "Americas",
  other: "Other",
};
const REGION_ORDER = ["asia", "europe", "americas", "other"] as const;

// ── 메인 컴포넌트 ────────────────────────────────────────────

export function CityDropdown({
  cities,
  initialCityName = "",
  initialCountry = "",
  required,
  label = "Base City",
  hint,
}: CityDropdownProps) {
  // 초기값: initialCityName과 일치하는 city 찾기
  const initialSelected =
    cities.find(
      (c) =>
        c.name.toLowerCase() === initialCityName.toLowerCase() &&
        (initialCountry ? c.country === initialCountry.toUpperCase() : true)
    ) ?? null;

  const [selected, setSelected] = useState<CityDropdownOption | null>(
    initialSelected
  );
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  // 검색 필터
  const filtered = query.trim()
    ? cities.filter(
        (c) =>
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          c.countryName.toLowerCase().includes(query.toLowerCase())
      )
    : cities;

  // 지역별 그룹핑
  const grouped: Partial<Record<string, CityDropdownOption[]>> = {};
  for (const c of filtered) {
    if (!grouped[c.region]) grouped[c.region] = [];
    grouped[c.region]!.push(c);
  }

  function handleSelect(city: CityDropdownOption) {
    setSelected(city);
    setOpen(false);
    setQuery("");
  }

  return (
    <div className="flex flex-col gap-1.5">
      {/* 레이블 */}
      <label className="text-xs font-medium text-neutral-600">
        {label}
        {required && <span className="ml-0.5 text-cat-purple">*</span>}
      </label>

      {/* hidden inputs — Server Action이 기존 name으로 받음 */}
      <input
        type="hidden"
        name="baseCity"
        value={selected?.name ?? ""}
      />
      <input
        type="hidden"
        name="baseCountry"
        value={selected?.country ?? ""}
      />

      {/* 선택 버튼 */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={[
          "flex w-full items-center gap-2 rounded-xl border px-4 py-3 text-sm transition-colors",
          open
            ? "border-cat-purple/50 bg-white"
            : "border-neutral-200 bg-white hover:border-neutral-300",
        ].join(" ")}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        {selected ? (
          <>
            <MapPin size={14} className="shrink-0 text-neutral-400" aria-hidden="true" />
            <span className="flex-1 text-left text-neutral-900 font-medium">
              {selected.name}
            </span>
            <span className="text-[11px] text-neutral-400">{selected.countryName}</span>
          </>
        ) : (
          <>
            <MapPin size={14} className="shrink-0 text-neutral-300" aria-hidden="true" />
            <span className="flex-1 text-left text-neutral-300">도시 선택</span>
          </>
        )}
        <ChevronDown
          size={14}
          className={[
            "shrink-0 text-neutral-400 transition-transform duration-150",
            open ? "rotate-180" : "",
          ].join(" ")}
          aria-hidden="true"
        />
      </button>

      {/* 드롭다운 패널 */}
      {open && (
        <div className="flex flex-col gap-2 rounded-xl border border-neutral-200 bg-white p-3 shadow-md">
          {/* 검색창 */}
          <div className="flex items-center gap-2 rounded-lg border border-neutral-100 bg-neutral-50 px-3 py-2">
            <Search size={13} className="shrink-0 text-neutral-400" aria-hidden="true" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="도시 또는 국가 검색"
              className="flex-1 bg-transparent text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
              aria-label="도시 검색"
              autoFocus
            />
          </div>

          {/* 도시 목록 */}
          <div className="max-h-56 overflow-y-auto" role="listbox">
            {REGION_ORDER.map((region) => {
              const list = grouped[region];
              if (!list?.length) return null;
              return (
                <div key={region} className="mb-2 last:mb-0">
                  <p className="mb-1 px-1 text-[9px] font-semibold tracking-widest text-neutral-300 uppercase">
                    {REGION_LABELS[region]}
                  </p>
                  {list.map((city) => {
                    const isSelected = selected?.id === city.id;
                    return (
                      <button
                        key={city.id}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => handleSelect(city)}
                        className={[
                          "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                          isSelected
                            ? "bg-neutral-900 text-white"
                            : "text-neutral-700 hover:bg-neutral-50",
                        ].join(" ")}
                      >
                        <span className="flex-1 font-medium">{city.name}</span>
                        <span
                          className={[
                            "text-[11px]",
                            isSelected ? "text-neutral-300" : "text-neutral-400",
                          ].join(" ")}
                        >
                          {city.countryName}
                        </span>
                        {isSelected && (
                          <Check size={13} className="shrink-0" aria-hidden="true" />
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })}
            {filtered.length === 0 && (
              <p className="py-4 text-center text-sm text-neutral-400">
                검색 결과가 없습니다
              </p>
            )}
          </div>
        </div>
      )}

      {/* 힌트 */}
      {hint && <p className="text-[11px] text-neutral-400">{hint}</p>}
    </div>
  );
}
