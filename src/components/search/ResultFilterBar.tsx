"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ALL_TAGS } from "@/data/dummy";

interface ResultFilterBarProps {
  query: string;
  initialTags?: string;
  initialType?: string;
}

export function ResultFilterBar({
  query,
  initialTags,
  initialType = "all",
}: ResultFilterBarProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [selectedTags, setSelectedTags] = useState<string[]>(
    initialTags ? initialTags.split(",").filter(Boolean) : []
  );
  const [type, setType] = useState(initialType);
  const [drawerOpen, setDrawerOpen] = useState(false);

  function push(nextTags: string[], nextType: string) {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (nextTags.length) params.set("tags", nextTags.join(","));
    if (nextType !== "all") params.set("type", nextType);
    startTransition(() => router.push(`/search?${params.toString()}`));
  }

  function removeTag(slug: string) {
    const next = selectedTags.filter((s) => s !== slug);
    setSelectedTags(next);
    push(next, type);
  }

  function applyDrawer(nextTags: string[], nextType: string) {
    setSelectedTags(nextTags);
    setType(nextType);
    setDrawerOpen(false);
    push(nextTags, nextType);
  }

  const hasFilter = selectedTags.length > 0 || type !== "all";

  return (
    <>
      <div className="flex items-center gap-2 overflow-x-auto px-4 py-2 scrollbar-none border-b border-neutral-100">
        {/* 타입 칩 */}
        {(["all", "guest", "based"] as const).map((t) => (
          <button
            key={t}
            onClick={() => {
              setType(t);
              push(selectedTags, t);
            }}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1 text-[11px] font-medium transition-colors",
              type === t
                ? "border-neutral-800 bg-neutral-900 text-white"
                : "border-neutral-200 bg-white text-neutral-500"
            )}
            aria-pressed={type === t}
          >
            {t === "all" ? "전체" : t === "guest" ? "Guest" : "Based"}
          </button>
        ))}

        <div className="h-4 w-px shrink-0 bg-neutral-200" />

        {/* 적용된 태그 */}
        {selectedTags.map((slug) => {
          const tag = ALL_TAGS.find((t) => t.slug === slug);
          return (
            <button
              key={slug}
              onClick={() => removeTag(slug)}
              className="flex shrink-0 items-center gap-1 rounded-full bg-neutral-900 px-2.5 py-1 text-[11px] text-white"
            >
              {tag?.name ?? slug}
              <X size={10} aria-hidden="true" />
            </button>
          );
        })}

        {/* 필터 버튼 */}
        <button
          onClick={() => setDrawerOpen(true)}
          className={cn(
            "ml-auto flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-medium transition-colors",
            hasFilter
              ? "border-neutral-800 bg-white text-neutral-800"
              : "border-neutral-200 bg-white text-neutral-500"
          )}
          aria-label="태그 필터"
        >
          <SlidersHorizontal size={11} aria-hidden="true" />
          필터
          {selectedTags.length > 0 && (
            <span className="ml-0.5 rounded-full bg-neutral-900 px-1.5 py-0.5 text-[10px] text-white">
              {selectedTags.length}
            </span>
          )}
        </button>
      </div>

      {/* 드로어 오버레이 */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/30"
          onClick={() => setDrawerOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* 태그 필터 드로어 */}
      <TagDrawer
        open={drawerOpen}
        selectedTags={selectedTags}
        onClose={() => setDrawerOpen(false)}
        onApply={(tags) => applyDrawer(tags, type)}
      />
    </>
  );
}

// ── 태그 드로어 ────────────────────────────────────────────

interface TagDrawerProps {
  open: boolean;
  selectedTags: string[];
  onClose: () => void;
  onApply: (tags: string[]) => void;
}

function TagDrawer({ open, selectedTags, onClose, onApply }: TagDrawerProps) {
  const [local, setLocal] = useState<string[]>(selectedTags);

  function toggle(slug: string, group: string) {
    if (group === "color" || group === "main") {
      // 같은 그룹 내 단일 선택
      const sameGroup = ALL_TAGS.filter((t) => t.group === group).map(
        (t) => t.slug
      );
      const cleared = local.filter((s) => !sameGroup.includes(s));
      setLocal(local.includes(slug) ? cleared : [...cleared, slug]);
    } else {
      setLocal(
        local.includes(slug)
          ? local.filter((s) => s !== slug)
          : [...local, slug]
      );
    }
  }

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 max-w-mobile mx-auto max-h-[78vh] overflow-y-auto rounded-t-2xl bg-white transition-transform duration-300",
        open ? "translate-y-0" : "translate-y-full pointer-events-none"
      )}
      role="dialog"
      aria-label="태그 필터"
      aria-modal="true"
    >
      <div className="sticky top-0 flex items-center justify-between border-b border-neutral-100 bg-white px-4 py-3">
        <span className="text-[13px] font-medium text-neutral-900">
          태그 필터
        </span>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setLocal([])}
            className="text-[11px] text-neutral-400 underline"
          >
            초기화
          </button>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full active:bg-neutral-100"
            aria-label="닫기"
          >
            <X size={18} className="text-neutral-500" />
          </button>
        </div>
      </div>

      {(["color", "main", "art"] as const).map((group) => (
        <div key={group} className="px-4 pt-4 pb-3">
          <p className="mb-2 text-[10px] font-medium uppercase tracking-widest text-neutral-400">
            {group === "color"
              ? "Color"
              : group === "main"
              ? "Main Style"
              : "Art Style"}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {ALL_TAGS.filter((t) => t.group === group).map((tag) => {
              const sel = local.includes(tag.slug);
              return (
                <button
                  key={tag.id}
                  onClick={() => toggle(tag.slug, group)}
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

      <div
        className="sticky bottom-0 border-t border-neutral-100 bg-white px-4 py-3"
        style={{
          paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))",
        }}
      >
        <button
          onClick={() => onApply(local)}
          className="w-full rounded-xl bg-neutral-900 py-3 text-sm font-medium text-white active:opacity-80"
        >
          결과 보기{local.length > 0 ? ` · ${local.length}개` : ""}
        </button>
      </div>
    </div>
  );
}
