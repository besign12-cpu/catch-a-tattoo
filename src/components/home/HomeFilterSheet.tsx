"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { ALL_TAGS } from "@/data/dummy";
import type { Tag } from "@/types";

const COLOR_TAGS = ALL_TAGS.filter((t) => t.group === "color");
const MAIN_TAGS = ALL_TAGS.filter((t) => t.group === "main");
const ART_TAGS = ALL_TAGS.filter((t) => t.group === "art");

const DRAG_CLOSE_THRESHOLD = 80; // px — 이 이상 내리면 닫기

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
  // 드래그 중 이동 거리 (translateY)
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startYRef = useRef(0);

  /* body 스크롤 잠금 */
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  /* 시트 닫힐 때 dragY 초기화 */
  useEffect(() => {
    if (!isOpen) setDragY(0);
  }, [isOpen]);

  /* 핸들바 pointerDown — 드래그 시작 */
  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    startYRef.current = e.clientY;
    setIsDragging(true);
  }

  /* pointerMove — 아래 방향만 추적 */
  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!isDragging) return;
    const delta = e.clientY - startYRef.current;
    setDragY(Math.max(0, delta)); // 위로는 이동 안 함
  }

  /* pointerUp — 임계값 판단 후 닫기 or 복귀 */
  function handlePointerUp() {
    if (!isDragging) return;
    setIsDragging(false);
    if (dragY >= DRAG_CLOSE_THRESHOLD) {
      setDragY(0);
      onDismiss(); // draft 버리고 닫기
    } else {
      setDragY(0); // 원위치 복귀
    }
  }

  // 드래그 중엔 transition 제거, 평소엔 적용
  const panelStyle: React.CSSProperties = {
    transform: isOpen ? `translateY(${dragY}px)` : "translateY(100%)",
    transition: isDragging ? "none" : "transform 300ms cubic-bezier(0.32, 0.72, 0, 1)",
    maxHeight: "75vh",
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
        {/* 핸들 영역 — 드래그 이벤트 여기서만 */}
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

        {/* 헤더 */}
        <div className="shrink-0 px-5 pb-3 pt-0">
          <span className="text-[15px] font-semibold text-neutral-900">
            Filter
          </span>
        </div>

        {/* 태그 그룹 — 스크롤 영역, 드래그 이벤트 없음 */}
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

        {/* Apply 버튼 — BottomNav + safe-area 위로 고정 */}
        <div
          className="shrink-0 border-t border-neutral-100 bg-white px-5 pt-4"
          style={{
            paddingBottom:
              "calc(env(safe-area-inset-bottom, 0px) + 80px)",
          }}
        >
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
