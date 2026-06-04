"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ALL_TAGS } from "@/data/dummy";
import type { Tag } from "@/types";

const COLOR_TAGS = ALL_TAGS.filter((t) => t.group === "color");
const MAIN_TAGS = ALL_TAGS.filter((t) => t.group === "main");
const ART_TAGS = ALL_TAGS.filter((t) => t.group === "art");

interface TagGroupProps {
  label: string;
  tags: Tag[];
  draftSlugs: string[];
  onToggle: (slug: string) => void;
}

function TagGroup({ label, tags, draftSlugs, onToggle }: TagGroupProps) {
  return (
    <div className="mb-5">
      <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
        {label}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <button
            key={tag.id}
            onClick={() => onToggle(tag.slug)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-[12px] font-medium leading-none transition-colors active:scale-95",
              draftSlugs.includes(tag.slug)
                ? "border-neutral-900 bg-neutral-900 text-white"
                : "border-neutral-200 bg-white text-neutral-600"
            )}
            aria-pressed={draftSlugs.includes(tag.slug)}
          >
            {tag.name}
          </button>
        ))}
      </div>
    </div>
  );
}

interface HomeFilterSheetProps {
  isOpen: boolean;
  draftSlugs: string[];
  onToggle: (slug: string) => void;
  onReset: () => void;
  onApply: () => void;
  onDismiss: () => void;
}

export function HomeFilterSheet({
  isOpen,
  draftSlugs,
  onToggle,
  onReset,
  onApply,
  onDismiss,
}: HomeFilterSheetProps) {
  const hasSelection = draftSlugs.length > 0;

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* 딤 배경 — draft 버리고 닫기 */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/40 transition-opacity duration-300",
          isOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        )}
        onClick={onDismiss}
        aria-hidden="true"
      />

      {/* 바텀시트 패널 */}
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 mx-auto flex max-w-[430px] flex-col rounded-t-2xl bg-white transition-transform duration-300 ease-out",
          isOpen ? "translate-y-0" : "translate-y-full"
        )}
        style={{ maxHeight: "75vh" }}
        role="dialog"
        aria-modal="true"
        aria-label="태그 필터"
      >
        {/* 헤더 — Filter 타이틀 + X 버튼 */}
        <div className="flex shrink-0 items-center justify-between px-5 pt-5 pb-4">
          <span className="text-[15px] font-semibold text-neutral-900">
            Filter
          </span>
          <button
            onClick={onDismiss}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 transition-colors active:bg-neutral-200"
            aria-label="닫기"
          >
            <X size={14} strokeWidth={2.5} />
          </button>
        </div>

        {/* 태그 그룹 목록 — 스크롤 영역 */}
        <div className="flex-1 overflow-y-auto px-5 pb-2">
          <TagGroup
            label="Color"
            tags={COLOR_TAGS}
            draftSlugs={draftSlugs}
            onToggle={onToggle}
          />
          <TagGroup
            label="Main Style"
            tags={MAIN_TAGS}
            draftSlugs={draftSlugs}
            onToggle={onToggle}
          />
          <TagGroup
            label="Art Style"
            tags={ART_TAGS}
            draftSlugs={draftSlugs}
            onToggle={onToggle}
          />
        </div>

        {/* 하단 버튼 영역 — BottomNav + safe-area 위로 고정 */}
        <div
          className="shrink-0 border-t border-neutral-100 bg-white px-5 pt-4"
          style={{
            paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 80px)",
          }}
        >
          <div className="flex items-center gap-3">
            {/* Reset — draft 선택 있을 때만 활성 */}
            <button
              onClick={onReset}
              disabled={!hasSelection}
              className={cn(
                "text-[13px] font-medium transition-colors",
                hasSelection
                  ? "text-neutral-700 active:text-neutral-900"
                  : "cursor-not-allowed text-neutral-300"
              )}
            >
              Reset
            </button>

            {/* Apply */}
            <button
              onClick={onApply}
              className="flex-1 rounded-xl bg-neutral-900 py-3 text-[13px] font-medium text-white active:scale-95"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
