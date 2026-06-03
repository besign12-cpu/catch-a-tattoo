import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { PageContainer } from "@/components/layout/PageContainer";
import { Avatar } from "@/components/ui/Avatar";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { TagList } from "@/components/ui/TagChip";
import { FeedSkeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { SearchFilterBar } from "@/components/search/SearchFilterBar";

import { searchArtists } from "@/lib/queries/artists";
import { formatDateRange, calcDDay } from "@/lib/utils";

export const metadata: Metadata = { title: "검색" };

interface SearchPageProps {
  searchParams: Promise<{
    city?: string;
    tags?: string;
    start?: string;
    end?: string;
    type?: string;
  }>;
}

async function SearchResults({
  city,
  tags,
  start,
  end,
  type,
}: {
  city?: string;
  tags?: string;
  start?: string;
  end?: string;
  type?: string;
}) {
  const tagSlugs = tags ? tags.split(",").filter(Boolean) : [];
  const results = await searchArtists({
    tagSlugs,
    city,
    startDate: start,
    endDate: end,
    type: (type as "all" | "guest" | "based") ?? "all",
  }).catch(() => null);

  if (!results) {
    return <ErrorState type="network" compact className="mx-3 mt-3" />;
  }

  if (results.length === 0) {
    return (
      <div className="px-3 pt-6 text-center">
        <p className="text-sm text-neutral-500 mb-1">검색 결과가 없습니다</p>
        <p className="text-xs text-neutral-400">태그나 도시 조건을 변경해보세요</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-neutral-100">
      {results.map((r) => (
        <Link
          key={r.artistId}
          href={`/artists/${r.instagramHandle ?? r.artistId}`}
          className="flex items-center gap-3 bg-white px-4 py-3 active:bg-neutral-50"
        >
          <Avatar name={r.displayName} size="sm" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-[13px] font-medium text-neutral-900">
                {r.displayName}
              </span>
              {r.isVerified && <VerifiedBadge size={12} />}
            </div>
            {r.nextSchedule && (
              <div className="flex items-center gap-1 text-[11px] text-emerald-600 mb-1">
                <span>
                  {r.nextSchedule.city} ·{" "}
                  {formatDateRange(r.nextSchedule.startDate, r.nextSchedule.endDate)}
                </span>
                <span className="rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px]">
                  {calcDDay(r.nextSchedule.startDate, r.nextSchedule.endDate)}
                </span>
              </div>
            )}
            <TagList
              tags={r.tags}
              highlightedSlugs={tagSlugs}
              size="sm"
              max={4}
            />
          </div>
          <ChevronRight size={16} className="shrink-0 text-neutral-300" />
        </Link>
      ))}
    </div>
  );
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const sp = await searchParams;

  return (
    <PageContainer className="bg-white">
      <header className="sticky top-0 z-40 border-b border-neutral-100 bg-white">
        <div className="px-4 pt-3 pb-0">
          <p className="text-[17px] font-medium text-neutral-900 mb-3">검색</p>
        </div>
        <SearchFilterBar
          initialCity={sp.city}
          initialTags={sp.tags}
          initialType={sp.type}
        />
      </header>

      <Suspense fallback={<FeedSkeleton />}>
        <SearchResults
          city={sp.city}
          tags={sp.tags}
          start={sp.start}
          end={sp.end}
          type={sp.type}
        />
      </Suspense>
    </PageContainer>
  );
}
