"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ALL_TAGS } from "@/data/dummy";

const TYPE_LABELS: Record<string, string> = {
  all: "전체",
  guest: "Guest",
  based: "Based",
};

interface SearchFilterBarProps {
  initialCity?: string;
  initialTags?: string;
  initialType?: string;
}

export function SearchFilterBar({
  initialCity,
  initialTags,
  initialType = "all",
}: SearchFilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const [city, setCity] = useState(initialCity ?? "");
  const [type, setType] = useState(initialType);
  const [selectedTags, setSelectedTags] = useState<string[]>(
    initialTags ? initialTags.split(",").filter(Boolean) : []
  );
  const [drawerOpen, setDrawerOpen] = useState(false);

  function applyFilters(
    newCity: string,
    newTags: string[],
    newType: string
  ) {
    const params = new URLSearchParams();
    if (newCity) params.set("city", newCity);
    if (newTags.length) params.set("tags", newTags.join(","));
    if (newType && newType !== "all") params.set("type", newType);
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
    setDrawerOpen(false);
  }

  function clearAll() {
    setCity("");
    setSelectedTags([]);
    setType("all");
    applyFilters("", [], "all");
  }

  const hasFilters = city || selectedTags.length > 0 || type !== "all";

  return (
    <>
      <div className="flex items-center gap-2 px-4 py-2 border-b border-neutral-100">
        {/* 타입 탭 */}
        <div className="flex gap-1">
          {["all", "guest", "based"].map((t) => (
            <button
              key={t}
              onClick={() => {
                setType(t);
                applyFilters(city, selectedTags, t);
              }}
              className={cn(
                "rounded-lg px-3 py-1.5 text-[11px] font-medium border transition-colors",
                type === t
                  ? "bg-neutral-900 text-white border-neutral-900"
                  : "bg-white text-neutral-500 border-neutral-200"
              )}
              aria-pressed={type === t}
            >
              {TYPE_LABELS[t]}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        {/* Filter 버튼 */}
        <button
          onClick={() => setDrawerOpen(true)}
          className={cn(
            "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-medium transition-colors",
            hasFilters
              ? "border-neutral-800 bg-white text-neutral-800"
              : "border-neutral-200 bg-white text-neutral-500"
          )}
          aria-label="필터 열기"
          disabled={isPending}
        >
          <SlidersHorizontal size={12} aria-hidden="true" />
          Filter
          {selectedTags.length > 0 && (
            <span className="ml-0.5 rounded-full bg-neutral-900 px-1.5 py-0.5 text-[10px] text-white">
              {selectedTags.length}
            </span>
          )}
        </button>
      </div>

      {/* 적용된 태그 칩 */}
      {selectedTags.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto px-4 py-2 scrollbar-none border-b border-neutral-100">
          {selectedTags.map((slug) => {
            const tag = ALL_TAGS.find((t) => t.slug === slug);
            return (
              <button
                key={slug}
                onClick={() => {
                  const next = selectedTags.filter((s) => s !== slug);
                  setSelectedTags(next);
                  applyFilters(city, next, type);
                }}
                className="flex shrink-0 items-center gap-1 rounded-full bg-neutral-900 px-2.5 py-1 text-[11px] text-white"
              >
                {tag?.name ?? slug}
                <X size={10} aria-hidden="true" />
              </button>
            );
          })}
          <button
            onClick={clearAll}
            className="shrink-0 text-[11px] text-neutral-400 underline"
          >
            초기화
          </button>
        </div>
      )}

      {/* 필터 드로어 오버레이 */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/30"
          onClick={() => setDrawerOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* 필터 드로어 */}
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 max-h-[80vh] overflow-y-auto rounded-t-2xl bg-white transition-transform duration-300 ease-out",
          drawerOpen ? "translate-y-0" : "translate-y-full pointer-events-none"
        )}
        role="dialog"
        aria-label="태그 필터"
        aria-modal="true"
      >
        {/* 드로어 헤더 */}
        <div className="sticky top-0 flex items-center justify-between border-b border-neutral-100 bg-white px-4 py-3.5">
          <span className="text-[13px] font-medium text-neutral-900">태그 필터</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setSelectedTags([]);
              }}
              className="text-[11px] text-neutral-400 underline"
            >
              초기화
            </button>
            <button
              onClick={() => setDrawerOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-500 active:bg-neutral-100"
              aria-label="닫기"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* 태그 그룹 */}
        {(["color", "main", "art"] as const).map((group) => (
          <div key={group} className="px-4 pt-4 pb-3">
            <p className="mb-2 text-[10px] font-medium uppercase tracking-widest text-neutral-400">
              {group === "color" ? "Color" : group === "main" ? "Main Style" : "Art Style"}
              {group === "color" || group === "main" ? (
                <span className="ml-1.5 text-red-400">필수</span>
              ) : (
                <span className="ml-1.5 text-neutral-300">선택</span>
              )}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {ALL_TAGS.filter((t) => t.group === group).map((tag) => {
                const sel = selectedTags.includes(tag.slug);
                return (
                  <button
                    key={tag.id}
                    onClick={() => {
                      if (group === "color" || group === "main") {
                        // 단일 선택
                        const others = selectedTags.filter(
                          (s) =>
                            !ALL_TAGS.find(
                              (t2) => t2.slug === s && t2.group === group
                            )
                        );
                        setSelectedTags(sel ? others : [...others, tag.slug]);
                      } else {
                        setSelectedTags(
                          sel
                            ? selectedTags.filter((s) => s !== tag.slug)
                            : [...selectedTags, tag.slug]
                        );
                      }
                    }}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors active:scale-95",
                      sel
                        ? "border-neutral-900 bg-neutral-900 text-white"
                        : "border-neutral-200 bg-white text-neutral-600"
                    )}
                    aria-pressed={sel}
                  >
                    {tag.name}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* 적용 버튼 */}
        <div className="sticky bottom-0 border-t border-neutral-100 bg-white px-4 py-3"
          style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}>
          <button
            onClick={() => applyFilters(city, selectedTags, type)}
            className="w-full rounded-xl bg-neutral-900 py-3 text-sm font-medium text-white active:opacity-80"
          >
            결과 보기
            {selectedTags.length > 0 && ` · ${selectedTags.length}개 태그 적용`}
          </button>
        </div>
      </div>
    </>
  );
}
