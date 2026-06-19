"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { ChevronRight, Search, Check, MapPin, Bell } from "lucide-react";
import { updateBaseCity, updateInterestTags } from "@/actions/settings";
import type { UpdateBaseCityState, UpdateInterestsState } from "@/actions/settings";
import type { Tag } from "@/types";

// ── 타입 ────────────────────────────────────────────────────

export interface SettingsCityOption {
  id: string;
  name: string;
  country: string;
  countryName: string;
  region: "asia" | "europe" | "americas" | "other";
}

export interface SettingsClientProps {
  currentBaseCity: string | null;
  currentBaseCountry: string | null;
  baseCityChangedAt: string | null;
  daysUntilChange: number | null; // null = 변경 가능
  cities: SettingsCityOption[];
  tags: Tag[];
}

// ── Submit 버튼 ──────────────────────────────────────────────

function SaveButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-2xl bg-neutral-900 py-3.5 text-sm font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed active:opacity-80 transition-opacity"
    >
      {pending ? "저장 중..." : label}
    </button>
  );
}

// ── Base City 섹션 ───────────────────────────────────────────

function BaseCitySection({
  currentBaseCity,
  currentBaseCountry,
  daysUntilChange,
  cities,
}: Pick<
  SettingsClientProps,
  "currentBaseCity" | "currentBaseCountry" | "daysUntilChange" | "cities"
>) {
  const [showPicker, setShowPicker] = useState(false);
  const [selectedCity, setSelectedCity] = useState<SettingsCityOption | null>(null);
  const [query, setQuery] = useState("");

  const canChange = daysUntilChange === null;
  const initialState: UpdateBaseCityState = { status: "idle" };
  const [state, formAction] = useFormState(updateBaseCity, initialState);

  const filtered = query.trim()
    ? cities.filter(
        (c) =>
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          c.countryName.toLowerCase().includes(query.toLowerCase())
      )
    : cities;

  const regionLabels: Record<string, string> = {
    asia: "Asia", europe: "Europe", americas: "Americas", other: "Other",
  };
  const regionOrder = ["asia", "europe", "americas", "other"] as const;
  const grouped: Partial<Record<string, SettingsCityOption[]>> = {};
  for (const c of filtered) {
    if (!grouped[c.region]) grouped[c.region] = [];
    grouped[c.region]!.push(c);
  }

  return (
    <div className="rounded-2xl border border-neutral-100 bg-white px-5 py-4">
      <p className="mb-3 text-[11px] font-semibold tracking-widest text-neutral-400 uppercase">
        Base City
      </p>

      {/* 현재 Base City */}
      <div className="mb-3 flex items-center gap-2 rounded-xl border border-neutral-100 bg-neutral-50 px-4 py-3">
        <MapPin size={14} className="shrink-0 text-neutral-400" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold text-neutral-900">
            {currentBaseCity ?? "미설정"}
          </p>
          {currentBaseCountry && (
            <p className="text-[11px] text-neutral-400">{currentBaseCountry}</p>
          )}
        </div>
        <span className="shrink-0 rounded-full bg-neutral-200 px-2 py-0.5 text-[10px] font-medium text-neutral-500">
          현재
        </span>
      </div>

      {/* 30일 제한 안내 */}
      {!canChange && daysUntilChange !== null && (
        <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-[12px] font-semibold text-amber-800">변경 제한 중</p>
          <p className="mt-0.5 text-[11px] text-amber-600 leading-relaxed">
            Base City는 30일에 한 번만 변경할 수 있습니다.
            <br />
            <span className="font-semibold">{daysUntilChange}일 후</span> 변경 가능합니다.
          </p>
        </div>
      )}

      {/* Bring 종료 안내 */}
      {canChange && (
        <div className="mb-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-2.5">
          <p className="text-[11px] text-blue-700 leading-relaxed">
            Base City를 변경하면 기존 Bring This Artist 수요가 모두 종료됩니다.
          </p>
        </div>
      )}

      {/* 성공 메시지 */}
      {state.status === "success" && (
        <div className="mb-3 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-2.5">
          <p className="text-[12px] font-semibold text-emerald-700">
            Base City가 {state.city}으로 변경되었습니다.
          </p>
        </div>
      )}

      {/* 에러 메시지 */}
      {state.status === "error" && (
        <div className="mb-3 rounded-xl border border-red-100 bg-red-50 px-4 py-2.5">
          <p className="text-[12px] text-red-700">{state.message}</p>
        </div>
      )}

      {/* 도시 선택 버튼 */}
      {canChange && !showPicker && (
        <button
          onClick={() => setShowPicker(true)}
          className="flex w-full items-center justify-between rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-700 hover:border-neutral-300 active:bg-neutral-50 transition-colors"
        >
          <span>{selectedCity ? selectedCity.name : "도시 변경"}</span>
          <ChevronRight size={15} className="text-neutral-400" aria-hidden="true" />
        </button>
      )}

      {/* 도시 선택 피커 */}
      {canChange && showPicker && (
        <div className="flex flex-col gap-3">
          {/* 검색 */}
          <div className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2">
            <Search size={14} className="shrink-0 text-neutral-400" aria-hidden="true" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="도시 검색"
              className="flex-1 bg-transparent text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
              aria-label="도시 검색"
              autoFocus
            />
          </div>

          {/* 도시 목록 */}
          <div className="max-h-64 overflow-y-auto flex flex-col gap-3">
            {regionOrder.map((region) => {
              const list = grouped[region];
              if (!list?.length) return null;
              return (
                <div key={region}>
                  <p className="mb-1.5 text-[10px] font-semibold tracking-widest text-neutral-400 uppercase">
                    {regionLabels[region]}
                  </p>
                  <div className="flex flex-col gap-1">
                    {list.map((city) => {
                      const isSelected = selectedCity?.id === city.id;
                      return (
                        <button
                          key={city.id}
                          type="button"
                          onClick={() => {
                            setSelectedCity(city);
                            setShowPicker(false);
                            setQuery("");
                          }}
                          className={[
                            "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition-colors",
                            isSelected
                              ? "bg-neutral-900 text-white"
                              : "bg-neutral-50 text-neutral-700 hover:bg-neutral-100",
                          ].join(" ")}
                        >
                          <span className="flex-1 text-[13px] font-medium">{city.name}</span>
                          <span className={["text-[11px]", isSelected ? "text-neutral-300" : "text-neutral-400"].join(" ")}>
                            {city.countryName}
                          </span>
                          {isSelected && <Check size={13} aria-hidden="true" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <p className="py-4 text-center text-sm text-neutral-400">
                검색 결과가 없습니다
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => { setShowPicker(false); setQuery(""); }}
            className="text-center text-[12px] text-neutral-400 active:opacity-70 py-1"
          >
            취소
          </button>
        </div>
      )}

      {/* 저장 폼 */}
      {canChange && selectedCity && !showPicker && (
        <form action={formAction} className="mt-3">
          <input type="hidden" name="cityId"   value={selectedCity.id} />
          <input type="hidden" name="cityName" value={selectedCity.name} />
          <input type="hidden" name="country"  value={selectedCity.country} />
          <SaveButton label={`${selectedCity.name}으로 변경`} />
        </form>
      )}
    </div>
  );
}

// ── 관심 장르 섹션 ───────────────────────────────────────────

const TAG_GROUPS: Record<string, string> = {
  color: "Color", main: "메인 스타일", art: "세부 스타일",
};

function InterestTagsSection({ tags }: { tags: Tag[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const initialState: UpdateInterestsState = { status: "idle" };
  const [state, formAction] = useFormState(updateInterestTags, initialState);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else {
        if (next.size >= 6) return prev;
        next.add(id);
      }
      return next;
    });
  }

  const grouped: Record<string, Tag[]> = {};
  for (const tag of tags) {
    if (!grouped[tag.group]) grouped[tag.group] = [];
    grouped[tag.group].push(tag);
  }

  return (
    <div className="rounded-2xl border border-neutral-100 bg-white px-5 py-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[11px] font-semibold tracking-widest text-neutral-400 uppercase">
          관심 장르
        </p>
        <span className="text-[11px] text-neutral-300">
          {selected.size}/6
        </span>
      </div>

      {state.status === "success" && (
        <div className="mb-3 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-2.5">
          <p className="text-[12px] font-semibold text-emerald-700">저장되었습니다.</p>
        </div>
      )}

      {state.status === "error" && (
        <div className="mb-3 rounded-xl border border-red-100 bg-red-50 px-4 py-2.5">
          <p className="text-[12px] text-red-700">{state.message}</p>
        </div>
      )}

      <form action={formAction} className="flex flex-col gap-4">
        {(["color", "main", "art"] as const).map((group) => {
          const groupTags = grouped[group];
          if (!groupTags?.length) return null;
          return (
            <div key={group}>
              <p className="mb-2 text-[10px] font-semibold tracking-widest text-neutral-400 uppercase">
                {TAG_GROUPS[group]}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {groupTags.map((tag) => {
                  const isSelected = selected.has(tag.id);
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggle(tag.id)}
                      className={[
                        "rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors",
                        isSelected
                          ? "bg-neutral-900 text-white"
                          : "border border-neutral-200 bg-neutral-50 text-neutral-600 hover:border-neutral-300",
                      ].join(" ")}
                    >
                      {tag.name}
                      {/* hidden input for form submission */}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* hidden inputs — 선택된 태그 ID */}
        {Array.from(selected).map((id) => (
          <input key={id} type="hidden" name="tagIds" value={id} />
        ))}

        <p className="text-[11px] text-neutral-300">
          * 관심 장르 실저장은 Sprint 5에서 연결됩니다
        </p>

        <SaveButton label="관심 장르 저장" />
      </form>
    </div>
  );
}

// ── 알림 설정 섹션 ───────────────────────────────────────────

function NotificationSection() {
  const [scheduleAlert, setScheduleAlert] = useState(true);
  const [bringAlert, setBringAlert]       = useState(false);

  return (
    <div className="rounded-2xl border border-neutral-100 bg-white px-5 py-4">
      <p className="mb-3 text-[11px] font-semibold tracking-widest text-neutral-400 uppercase">
        알림 설정
      </p>

      <div className="flex flex-col divide-y divide-neutral-50">
        <div className="flex items-center justify-between py-3">
          <div>
            <p className="text-[13px] font-medium text-neutral-900">일정 알림</p>
            <p className="text-[11px] text-neutral-400">팔로우 아티스트 일정 등록/수정</p>
          </div>
          <button
            type="button"
            onClick={() => setScheduleAlert((v) => !v)}
            className={[
              "relative h-6 w-10 rounded-full transition-colors duration-200",
              scheduleAlert ? "bg-neutral-900" : "bg-neutral-200",
            ].join(" ")}
            aria-label={`일정 알림 ${scheduleAlert ? "끄기" : "켜기"}`}
            role="switch"
            aria-checked={scheduleAlert}
          >
            <span
              className={[
                "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200",
                scheduleAlert ? "translate-x-4" : "translate-x-0.5",
              ].join(" ")}
            />
          </button>
        </div>

        <div className="flex items-center justify-between py-3">
          <div>
            <p className="text-[13px] font-medium text-neutral-900">Bring 알림</p>
            <p className="text-[11px] text-neutral-400">내 Bring 수요 임계값 도달</p>
          </div>
          <button
            type="button"
            onClick={() => setBringAlert((v) => !v)}
            className={[
              "relative h-6 w-10 rounded-full transition-colors duration-200",
              bringAlert ? "bg-neutral-900" : "bg-neutral-200",
            ].join(" ")}
            aria-label={`Bring 알림 ${bringAlert ? "끄기" : "켜기"}`}
            role="switch"
            aria-checked={bringAlert}
          >
            <span
              className={[
                "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200",
                bringAlert ? "translate-x-4" : "translate-x-0.5",
              ].join(" ")}
            />
          </button>
        </div>
      </div>

      <div className="mt-2 flex items-center gap-1.5 rounded-xl bg-neutral-50 px-3 py-2">
        <Bell size={12} className="shrink-0 text-neutral-400" aria-hidden="true" />
        <p className="text-[11px] text-neutral-400">
          알림 실연결은 Sprint 5에서 진행됩니다
        </p>
      </div>
    </div>
  );
}

// ── 메인 Export ─────────────────────────────────────────────

export function SettingsClient({
  currentBaseCity,
  currentBaseCountry,
  daysUntilChange,
  cities,
  tags,
}: SettingsClientProps) {
  return (
    <div className="flex flex-col gap-4 px-4 py-4 pb-10">
      <BaseCitySection
        currentBaseCity={currentBaseCity}
        currentBaseCountry={currentBaseCountry}
        daysUntilChange={daysUntilChange}
        cities={cities}
      />
      <InterestTagsSection tags={tags} />
      <NotificationSection />
    </div>
  );
}
