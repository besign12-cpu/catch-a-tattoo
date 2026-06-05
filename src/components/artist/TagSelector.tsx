"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Tag, TagGroup } from "@/types";

// ── 그룹 메타 ────────────────────────────────────────────────

const GROUP_META: Record<
  TagGroup,
  { label: string; rule: string; required: boolean; max: number }
> = {
  color: { label: "Color", rule: "필수 1개", required: true, max: 1 },
  main: { label: "Main Style", rule: "필수 1개", required: true, max: 1 },
  art: { label: "Art Style", rule: "선택 0–4개", required: false, max: 4 },
};

const GROUP_ORDER: TagGroup[] = ["color", "main", "art"];

// ── 선택 검증 ────────────────────────────────────────────────

function getValidationMessage(
  selected: string[],
  tags: Tag[]
): string | null {
  const selectedTags = tags.filter((t) => selected.includes(t.id));
  const colorCount = selectedTags.filter((t) => t.group === "color").length;
  const mainCount = selectedTags.filter((t) => t.group === "main").length;
  const artCount = selectedTags.filter((t) => t.group === "art").length;

  if (colorCount === 0) return "Color를 1개 선택해주세요.";
  if (mainCount === 0) return "Main Style을 1개 선택해주세요.";
  if (artCount > 4) return "Art Style은 최대 4개까지 선택 가능합니다.";
  if (selected.length < 2) return "태그를 최소 2개 선택해주세요.";
  if (selected.length > 6) return "태그는 최대 6개까지 선택 가능합니다.";
  return null;
}

// ── 컴포넌트 ─────────────────────────────────────────────────

interface TagSelectorProps {
  /** 전체 태그 목록 (서버에서 getAllTags()로 조회) */
  tags: Tag[];
}

export function TagSelector({ tags }: TagSelectorProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const grouped = GROUP_ORDER.reduce<Record<TagGroup, Tag[]>>(
    (acc, group) => {
      acc[group] = tags.filter((t) => t.group === group);
      return acc;
    },
    { color: [], main: [], art: [] }
  );

  function toggleTag(tag: Tag) {
    setSelectedIds((prev) => {
      if (prev.includes(tag.id)) {
        return prev.filter((id) => id !== tag.id);
      }

      if (tag.group === "color" || tag.group === "main") {
        // 같은 그룹 기존 선택 해제 후 새 항목 선택
        const sameGroup = tags
          .filter((t) => t.group === tag.group)
          .map((t) => t.id);
        return [...prev.filter((id) => !sameGroup.includes(id)), tag.id];
      }

      // art 그룹: 최대 4개
      const artSelected = prev.filter((id) =>
        tags.find((t) => t.id === id && t.group === "art")
      );
      if (artSelected.length >= 4) return prev;
      return [...prev, tag.id];
    });
  }

  const validationMessage = getValidationMessage(selectedIds, tags);
  const totalCount = selectedIds.length;

  return (
    <div className="flex flex-col gap-5">
      {GROUP_ORDER.map((group) => {
        const meta = GROUP_META[group];
        const groupTags = grouped[group];

        return (
          <div key={group}>
            {/* 그룹 헤더 */}
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-700">
                {meta.label}
              </span>
              <span
                className={cn(
                  "text-[10px]",
                  meta.required ? "text-cat-purple" : "text-neutral-400"
                )}
              >
                {meta.rule}
              </span>
            </div>

            {/* 태그 칩 */}
            <div className="flex flex-wrap gap-2">
              {groupTags.map((tag) => {
                const isSelected = selectedIds.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                      isSelected
                        ? "border-cat-black bg-cat-black text-white"
                        : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300"
                    )}
                  >
                    {tag.name}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* 선택 현황 */}
      <div className="flex items-center justify-between rounded-xl bg-neutral-50 px-4 py-3">
        <span className="text-xs text-neutral-400">
          {totalCount === 0
            ? "태그를 선택해주세요"
            : `${totalCount}개 선택됨 (최대 6개)`}
        </span>
        {validationMessage ? (
          <span className="text-[11px] text-red-500">{validationMessage}</span>
        ) : (
          <span className="text-[11px] text-cat-green">✓ 완료</span>
        )}
      </div>

      {/* hidden inputs — form submit 시 tagIds 전달 */}
      {selectedIds.map((id) => (
        <input key={id} type="hidden" name="tagIds" value={id} />
      ))}
    </div>
  );
}
