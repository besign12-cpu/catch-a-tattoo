"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ALL_TAGS } from "@/data/dummy";
import type { Tag } from "@/types";

const COLOR_TAGS = ALL_TAGS.filter((t) => t.group === "color");
const MAIN_TAGS = ALL_TAGS.filter((t) => t.group === "main");
const ART_TAGS = ALL_TAGS.filter((t) => t.group === "art");

const DRAG_CLOSE_THRESHOLD = 80; // px

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

  // ── 드래그 닫기 ───────────────────────────────────────────
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startYRef = useRef(0);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) setDragY(0);
  }, [isOpen]);

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    startYRef.current = e.clientY;
    setIsDragging(true);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!isDragging) return;
    setDragY(Math.max(0, e.clientY - startYRef.current));
  }

  function handlePointerUp() {
    if (!isDragging) return;
    setIsDragging(false);
    if (dragY >= DRAG_CLOSE_THRESHOLD) {
      setDragY(0);
      onDismiss();
    } else {
      setDragY(0);
    }
  }

  const panelStyle: React.CSSProperties = {
    transform: isOpen ? `translateY(${dragY}px)` : "translateY(100%)",
    transition: isDragging
      ? "none"
      : "transform 300ms cubic-bezier(0.32, 0.72, 0, 1)",
    maxHeight: "78vh",
  };

  return (
    <>
      {/* 딤 배경 */}
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
        className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-w-[430px] flex-col rounded-t-2xl bg-white"
        style={panelStyle}
        role="dialog"
        aria-modal="true"
        aria-label="태그 필터"
      >
        {/* 드래그 핸들 영역 */}
        <div
          className="flex shrink-0 cursor-grab touch-none justify-center py-3 active:cursor-grabbing"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          aria-label="드래그하여 닫기"
        >
          <div
            className={cn(
              "h-1 w-10 rounded-full transition-colors",
              isDragging ? "bg-neutral-400" : "bg-neutral-200"
            )}
          />
        </div>

        {/* 헤더 — Filter 타이틀 + X 버튼 */}
        <div className="flex shrink-0 items-center justify-between px-6 pb-4 pt-1">
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
        <div className="flex-1 overflow-y-auto px-6 pb-2">
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

        {/* 하단 액션바 — Airbnb 스타일 비대칭 레이아웃 */}
        <div
          className="shrink-0 border-t border-neutral-100 bg-white"
          style={{
            paddingTop: "16px",
            paddingLeft: "24px",
            paddingRight: "24px",
            paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 80px)",
          }}
        >
          <div className="flex items-center justify-between">
            {/* Reset — 텍스트 버튼, 충분한 터치 영역 */}
            <button
              onClick={hasSelection ? onReset : undefined}
              disabled={!hasSelection}
              className={cn(
                "flex min-h-[48px] items-center pr-8 text-[14px] font-medium underline underline-offset-2 transition-opacity",
                hasSelection
                  ? "text-neutral-900 opacity-100 active:opacity-60"
                  : "cursor-not-allowed text-neutral-400 opacity-40 no-underline"
              )}
            >
              Reset
            </button>

            {/* Apply — 메인 CTA */}
            <button
              onClick={onApply}
              className="flex h-14 w-[220px] items-center justify-center rounded-2xl bg-neutral-900 text-[14px] font-semibold text-white transition-opacity active:opacity-80"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
