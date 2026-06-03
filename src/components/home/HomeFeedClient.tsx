"use client";

import { useState } from "react";
import { FeedCard } from "@/components/artist/FeedCard";
import { HomeTagFilter } from "@/components/home/HomeTagFilter";
import { ErrorState } from "@/components/ui/ErrorState";
import type { FeedCard as FeedCardType } from "@/types";

interface HomeFeedClientProps {
  items: FeedCardType[];
}

export function HomeFeedClient({ items }: HomeFeedClientProps) {
  const [activeTag, setActiveTag] = useState<string | null>(null);

  function handleTagSelect(slug: string) {
    setActiveTag((prev) => (prev === slug ? null : slug));
  }

  const filtered =
    activeTag === null
      ? items
      : items.filter((item) =>
          item.artist.tags.some((tag) => tag.slug === activeTag)
        );

  return (
    <>
      <div className="border-b border-neutral-100 bg-white px-4 pb-0 pt-2">
        <HomeTagFilter activeSlug={activeTag} onSelect={handleTagSelect} />
      </div>

      <div className="space-y-2.5 px-3 py-3">
        {filtered.length === 0 ? (
          <div className="pt-4">
            <ErrorState
              type="generic"
              message="해당 태그의 일정이 없습니다"
              compact
            />
          </div>
        ) : (
          filtered.map((item) => (
            <FeedCard key={item.schedule.id} data={item} />
          ))
        )}
      </div>
    </>
  );
}
