"use client";

import { useEffect } from "react";
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
  onApply: () => void;
  onDismiss: () => void;
}

export function HomeFilterSheet({
  isOpen,
  draftSlugs,
  onToggle,
  onApply,
  onDismiss,
}: HomeFilterSheetProps) {
  /* 바텀시트 열릴 때 body 스크롤 잠금 */
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* 딤 배경 — 클릭 시 임시값 버리고 닫기 */}
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
          "fixed inset-x-0 bottom-0 z-50 mx-auto max-w-[430px] rounded-t-2xl bg-white transition-transform duration-300 ease-out",
          isOpen ? "translate-y-0" : "translate-y-full"
        )}
        role="dialog"
        aria-modal="true"
        aria-label="태그 필터"
      >
        {/* 핸들 바 */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1 w-10 rounded-full bg-neutral-200" />
        </div>

        {/* 헤더 */}
        <div className="px-5 pb-3 pt-2">
          <span className="text-[15px] font-semibold text-neutral-900">
            Filter
          </span>
        </div>

        {/* 태그 그룹 목록 */}
        <div
          className="overflow-y-auto px-5 pb-4"
          style={{ maxHeight: "60vh" }}
        >
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

        {/* Apply 단일 버튼 */}
        <div className="border-t border-neutral-100 px-5 py-4">
          <button
            onClick={onApply}
            className="w-full rounded-xl bg-neutral-900 py-3 text-[13px] font-medium text-white active:scale-95"
          >
            Apply
          </button>
        </div>
      </div>
    </>
  );
}
