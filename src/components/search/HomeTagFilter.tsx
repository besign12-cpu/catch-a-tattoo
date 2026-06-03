"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { ALL_TAGS } from "@/data/dummy";

// 홈에 노출할 태그 순서 (자주 검색되는 태그 우선)
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

export function HomeTagFilter() {
  const [active, setActive] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const router = useRouter();

  function handleSelect(slug: string) {
    if (active === slug) {
      // 같은 태그 다시 누르면 해제
      setActive(null);
      return;
    }
    setActive(slug);
    // 검색 페이지로 태그 필터 적용 이동
    startTransition(() => {
      router.push(`/search?tags=${slug}`);
    });
  }

  return (
    <div
      className="flex gap-1.5 overflow-x-auto pb-3 scrollbar-none"
      role="group"
      aria-label="태그 필터"
    >
      {FEATURED_TAGS.map((tag) => (
        <button
          key={tag.id}
          onClick={() => handleSelect(tag.slug)}
          className={cn(
            "shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-medium leading-none transition-colors active:scale-95",
            active === tag.slug
              ? "border-neutral-900 bg-neutral-900 text-white"
              : "border-neutral-200 bg-white text-neutral-600"
          )}
          aria-pressed={active === tag.slug}
        >
          {tag.name}
        </button>
      ))}
    </div>
  );
}
