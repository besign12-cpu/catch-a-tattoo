"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { ChevronRight, Search, Check, MapPin, Bell } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  updateBaseCity,
  updateInterestTags,
  updateNotifications,
} from "@/actions/settings";
import type {
  UpdateBaseCityState,
  UpdateInterestsState,
  UpdateNotifState,
} from "@/actions/settings";
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
  daysUntilChange: number | null;
  cities: SettingsCityOption[];
  tags: Tag[];
  /** 저장된 관심 장르 tag ID 목록 */
  savedTagIds: string[];
  /** 저장된 일정 알림 설정 */
  savedNotifSchedule: boolean;
  /** 저장된 Bring 알림 설정 */
  savedNotifBring: boolean;
}

// ── Submit 버튼 ──────────────────────────────────────────────

function SaveButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  const tc = useTranslations("common");
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-2xl bg-neutral-900 py-3.5 text-sm font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed active:opacity-80 transition-opacity"
    >
      {pending ? tc("saving") : label}
    </button>
  );
}

// ── Base City 섹션 ───────────────────────────────────────────

function BaseCitySection({
  currentBaseCity,
  currentBaseCountry,
  daysUntilChange,
  cities,
}: Pick<SettingsClientProps, "currentBaseCity" | "currentBaseCountry" | "daysUntilChange" | "cities">) {
  const t = useTranslations("settings");
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
        {t("baseCity")}
      </p>

      {/* 현재 Base City */}
      <div className="mb-3 flex items-center gap-2 rounded-xl border border-neutral-100 bg-neutral-50 px-4 py-3">
        <MapPin size={14} className="shrink-0 text-neutral-400" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold text-neutral-900">
            {currentBaseCity ?? t("baseCityNotSet")}
          </p>
          {currentBaseCountry && (
            <p className="text-[11px] text-neutral-400">{currentBaseCountry}</p>
          )}
        </div>
        <span className="shrink-0 rounded-full bg-neutral-200 px-2 py-0.5 text-[10px] font-medium text-neutral-500">
          {t("baseCityCurrent")}
        </span>
      </div>

      {!canChange && daysUntilChange !== null && (
        <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-[12px] font-semibold text-amber-800">{t("baseCityLocked")}</p>
          <p className="mt-0.5 text-[11px] text-amber-600 leading-relaxed">
            {t("baseCityLockedDesc", { days: daysUntilChange })}
          </p>
        </div>
      )}

      {canChange && (
        <div className="mb-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-2.5">
          <p className="text-[11px] text-blue-700 leading-relaxed">
            {t("baseCityBringWarning")}
          </p>
        </div>
      )}

      {state.status === "success" && (
        <div className="mb-3 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-2.5">
          <p className="text-[12px] font-semibold text-emerald-700">
            {t("baseCitySuccess", { city: state.city })}
          </p>
        </div>
      )}

      {state.status === "error" && (
        <div className="mb-3 rounded-xl border border-red-100 bg-red-50 px-4 py-2.5">
          <p className="text-[12px] text-red-700">{state.message}</p>
        </div>
      )}

      {canChange && !showPicker && (
        <button
          onClick={() => setShowPicker(true)}
          className="flex w-full items-center justify-between rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-700 hover:border-neutral-300 active:bg-neutral-50 transition-colors"
        >
          <span>{selectedCity ? selectedCity.name : t("baseCityChange")}</span>
          <ChevronRight size={15} className="text-neutral-400" aria-hidden="true" />
        </button>
      )}

      {canChange && showPicker && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2">
            <Search size={14} className="shrink-0 text-neutral-400" aria-hidden="true" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("searchCity")}
              className="flex-1 bg-transparent text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
              aria-label={t("searchCity")}
              autoFocus
            />
          </div>

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
                          onClick={() => { setSelectedCity(city); setShowPicker(false); setQuery(""); }}
                          className={[
                            "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition-colors",
                            isSelected ? "bg-neutral-900 text-white" : "bg-neutral-50 text-neutral-700 hover:bg-neutral-100",
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
              <p className="py-4 text-center text-sm text-neutral-400">{t("noCity")}</p>
            )}
          </div>

          <button
            type="button"
            onClick={() => { setShowPicker(false); setQuery(""); }}
            className="text-center text-[12px] text-neutral-400 active:opacity-70 py-1"
          >
            {t("baseCityChange")}
          </button>
        </div>
      )}

      {canChange && selectedCity && !showPicker && (
        <form action={formAction} className="mt-3">
          <input type="hidden" name="cityId"   value={selectedCity.id} />
          <input type="hidden" name="cityName" value={selectedCity.name} />
          <input type="hidden" name="country"  value={selectedCity.country} />
          <SaveButton label={t("baseCitySave", { city: selectedCity.name })} />
        </form>
      )}
    </div>
  );
}

// ── 관심 장르 섹션 ───────────────────────────────────────────

function InterestTagsSection({
  tags,
  savedTagIds,
}: {
  tags: Tag[];
  savedTagIds: string[];
}) {
  const t = useTranslations("settings");
  // 저장된 태그로 초기화
  const [selected, setSelected] = useState<Set<string>>(new Set(savedTagIds));
  const initialState: UpdateInterestsState = { status: "idle" };
  const [state, formAction] = useFormState(updateInterestTags, initialState);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
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
          {t("interestGenres")}
        </p>
        <span className="text-[11px] text-neutral-300">
          {t("interestCount", { count: selected.size })}
        </span>
      </div>

      {state.status === "success" && (
        <div className="mb-3 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-2.5">
          <p className="text-[12px] font-semibold text-emerald-700">{t("interestSaved")}</p>
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
          const groupLabel: Record<string, string> = {
            color: t("color"),
            main:  t("mainStyle"),
            art:   t("subStyle"),
          };
          return (
            <div key={group}>
              <p className="mb-2 text-[10px] font-semibold tracking-widest text-neutral-400 uppercase">
                {groupLabel[group]}
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
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {Array.from(selected).map((id) => (
          <input key={id} type="hidden" name="tagIds" value={id} />
        ))}

        <SaveButton label={t("interestSave")} />
      </form>
    </div>
  );
}

// ── 알림 설정 섹션 ───────────────────────────────────────────

function NotificationSection({
  savedNotifSchedule,
  savedNotifBring,
}: {
  savedNotifSchedule: boolean;
  savedNotifBring: boolean;
}) {
  const t = useTranslations("settings");
  const [scheduleAlert, setScheduleAlert] = useState(savedNotifSchedule);
  const [bringAlert,    setBringAlert]    = useState(savedNotifBring);

  const initialState: UpdateNotifState = { status: "idle" };
  const [state, formAction] = useFormState(updateNotifications, initialState);

  return (
    <div className="rounded-2xl border border-neutral-100 bg-white px-5 py-4">
      <p className="mb-3 text-[11px] font-semibold tracking-widest text-neutral-400 uppercase">
        {t("notifications")}
      </p>

      {state.status === "success" && (
        <div className="mb-3 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-2.5">
          <p className="text-[12px] font-semibold text-emerald-700">{t("notifSaved")}</p>
        </div>
      )}

      {state.status === "error" && (
        <div className="mb-3 rounded-xl border border-red-100 bg-red-50 px-4 py-2.5">
          <p className="text-[12px] text-red-700">{state.message}</p>
        </div>
      )}

      <form action={formAction} className="flex flex-col gap-2">
        {/* 일정 알림 */}
        <div className="flex items-center justify-between py-3 border-b border-neutral-50">
          <div>
            <p className="text-[13px] font-medium text-neutral-900">{t("notifSchedule")}</p>
            <p className="text-[11px] text-neutral-400">{t("notifScheduleDesc")}</p>
          </div>
          <button
            type="button"
            onClick={() => setScheduleAlert((v) => !v)}
            className={[
              "relative h-6 w-10 rounded-full transition-colors duration-200",
              scheduleAlert ? "bg-neutral-900" : "bg-neutral-200",
            ].join(" ")}
            aria-label={t("notifSchedule")}
            role="switch"
            aria-checked={scheduleAlert}
          >
            <span className={[
              "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200",
              scheduleAlert ? "translate-x-4" : "translate-x-0.5",
            ].join(" ")} />
          </button>
          {scheduleAlert && <input type="hidden" name="notifSchedule" value="on" />}
        </div>

        {/* Bring 알림 */}
        <div className="flex items-center justify-between py-3">
          <div>
            <p className="text-[13px] font-medium text-neutral-900">{t("notifBring")}</p>
            <p className="text-[11px] text-neutral-400">{t("notifBringDesc")}</p>
          </div>
          <button
            type="button"
            onClick={() => setBringAlert((v) => !v)}
            className={[
              "relative h-6 w-10 rounded-full transition-colors duration-200",
              bringAlert ? "bg-neutral-900" : "bg-neutral-200",
            ].join(" ")}
            aria-label={t("notifBring")}
            role="switch"
            aria-checked={bringAlert}
          >
            <span className={[
              "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200",
              bringAlert ? "translate-x-4" : "translate-x-0.5",
            ].join(" ")} />
          </button>
          {bringAlert && <input type="hidden" name="notifBring" value="on" />}
        </div>

        <div className="flex items-center gap-1.5 rounded-xl bg-neutral-50 px-3 py-2 mb-2">
          <Bell size={12} className="shrink-0 text-neutral-400" aria-hidden="true" />
          <p className="text-[11px] text-neutral-400">{t("notifComingSoon")}</p>
        </div>

        <SaveButton label={t("notifSave")} />
      </form>
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
  savedTagIds,
  savedNotifSchedule,
  savedNotifBring,
}: SettingsClientProps) {
  return (
    <div className="flex flex-col gap-4 px-4 py-4 pb-10">
      <BaseCitySection
        currentBaseCity={currentBaseCity}
        currentBaseCountry={currentBaseCountry}
        daysUntilChange={daysUntilChange}
        cities={cities}
      />
      <InterestTagsSection tags={tags} savedTagIds={savedTagIds} />
      <NotificationSection
        savedNotifSchedule={savedNotifSchedule}
        savedNotifBring={savedNotifBring}
      />
    </div>
  );
}
