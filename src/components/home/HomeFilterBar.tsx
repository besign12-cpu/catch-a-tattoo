"use client";

import { cn } from "@/lib/utils";
import { SlidersHorizontal } from "lucide-react";

export type PeriodFilter = "all" | "week";

interface HomeFilterBarProps {
  period: PeriodFilter;
  onPeriodChange: (period: PeriodFilter) => void;
  activeTagCount: number;
  onFilterOpen: () => void;
}

export function HomeFilterBar({
  period,
  onPeriodChange,
  activeTagCount,
  onFilterOpen,
}: HomeFilterBarProps) {
  return (
    <div className="flex items-center gap-2 pb-3">
      {/* 왼쪽: 기간 필터 칩 */}
      <div className="flex gap-1.5">
        <button
          onClick={() => onPeriodChange("all")}
          className={cn(
            "shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-medium leading-none transition-colors active:scale-95",
            period === "all"
              ? "border-neutral-900 bg-neutral-900 text-white"
              : "border-neutral-200 bg-white text-neutral-600"
          )}
          aria-pressed={period === "all"}
        >
          전체
        </button>
        <button
          onClick={() => onPeriodChange("week")}
          className={cn(
            "shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-medium leading-none transition-colors active:scale-95",
            period === "week"
              ? "border-neutral-900 bg-neutral-900 text-white"
              : "border-neutral-200 bg-white text-neutral-600"
          )}
          aria-pressed={period === "week"}
        >
          이번 주
        </button>
      </div>

      {/* 오른쪽: Filter 버튼 */}
      <div className="ml-auto">
        <button
          onClick={onFilterOpen}
          className={cn(
            "flex items-center gap-1 rounded-full border px-3 py-1.5 text-[11px] font-medium leading-none transition-colors active:scale-95",
            activeTagCount > 0
              ? "border-neutral-900 bg-neutral-900 text-white"
              : "border-neutral-200 bg-white text-neutral-600"
          )}
        >
          <SlidersHorizontal size={11} strokeWidth={2} />
          Filter
          {activeTagCount > 0 && (
            <span className="ml-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-white text-[9px] font-bold text-neutral-900">
              {activeTagCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
