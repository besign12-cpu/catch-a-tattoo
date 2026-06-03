"use client";

import { cn } from "@/lib/utils";
import { ALL_TAGS } from "@/data/dummy";

const FEATURED_TAG_SLUGS = [
  "black",
  "color-tag",
  "fine-line",
  "pet",
  "blackwork",
  "realism",
  "japanese",
  "cute",
  "micro",
  "geometric",
  "handpoke",
  "ornamental",
];

const FEATURED_TAGS = FEATURED_TAG_SLUGS
  .map((slug) => ALL_TAGS.find((t) => t.slug === slug))
  .filter((t): t is NonNullable<typeof t> => t !== undefined);

interface HomeTagFilterProps {
  activeSlug: string | null;
  onSelect: (slug: string) => void;
}

export function HomeTagFilter({ activeSlug, onSelect }: HomeTagFilterProps) {
  return (
    <div
      className="flex gap-1.5 overflow-x-auto pb-3 scrollbar-none"
      role="group"
      aria-label="태그 필터"
    >
      {FEATURED_TAGS.map((tag) => (
        <button
          key={tag.id}
          onClick={() => onSelect(tag.slug)}
          className={cn(
            "shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-medium leading-none transition-colors active:scale-95",
            activeSlug === tag.slug
              ? "border-neutral-900 bg-neutral-900 text-white"
              : "border-neutral-200 bg-white text-neutral-600"
          )}
          aria-pressed={activeSlug === tag.slug}
        >
          {tag.name}
        </button>
      ))}
    </div>
  );
}
