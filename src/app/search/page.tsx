import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, ArrowLeft } from "lucide-react";

import { PageContainer } from "@/components/layout/PageContainer";
import { Avatar } from "@/components/ui/Avatar";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { TagList } from "@/components/ui/TagChip";
import { FeedSkeleton } from "@/components/ui/Skeleton";
import { SearchInput } from "@/components/search/SearchInput";
import { ResultFilterBar } from "@/components/search/ResultFilterBar";

import { searchArtists } from "@/lib/queries/artists";
import { formatDateRange, calcDDay } from "@/lib/utils";

export const metadata: Metadata = { title: "검색" };

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    tags?: string;
    type?: string;
  }>;
}

async function SearchResults({
  q,
  tags,
  type,
}: {
  q?: string;
  tags?: string;
  type?: string;
}) {
  // q가 없으면 결과 없음
  if (!q?.trim()) {
    return (
      <p className="py-12 text-center text-sm text-neutral-400">
        아티스트 이름이나 도시를 검색해보세요
      </p>
    );
  }

  const tagSlugs = tags ? tags.split(",").filter(Boolean) : [];

  // q 값으로 도시 검색 + 아티스트 이름 검색 병렬 시도
  const [byCity, byName] = await Promise.all([
    searchArtists({
      city: q,
      tagSlugs,
      type: (type as "all" | "guest" | "based") ?? "all",
    }).catch(() => []),
    searchArtists({
      tagSlugs,
      type: (type as "all" | "guest" | "based") ?? "all",
    }).catch(() => []),
  ]);

  // 도시 결과 우선, 이름 필터 후 중복 제거
  const nameFiltered = byName.filter((r) =>
    r.displayName.toLowerCase().includes(q.toLowerCase()) ||
    (r.instagramHandle ?? "").toLowerCase().includes(q.toLowerCase())
  );

  const seen = new Set<string>();
  const results = [...byCity, ...nameFiltered].filter((r) => {
    if (seen.has(r.artistId)) return false;
    seen.add(r.artistId);
    return true;
  });

  if (results.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-neutral-500 mb-1">
          &quot;{q}&quot; 검색 결과가 없습니다
        </p>
        <p className="text-xs text-neutral-400">
          다른 이름이나 도시로 검색해보세요
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-neutral-100">
      <p className="px-4 py-2 text-[11px] text-neutral-400">
        {results.length}명의 아티스트
      </p>
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
              <div className="flex items-center gap-1 mb-1 text-[11px] text-emerald-600">
                <span>
                  {r.nextSchedule.city} ·{" "}
                  {formatDateRange(
                    r.nextSchedule.startDate,
                    r.nextSchedule.endDate
                  )}
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
        <div className="flex items-center gap-2 px-4 py-3">
          <Link
            href="/"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-neutral-700 active:bg-neutral-100"
            aria-label="홈으로"
          >
            <ArrowLeft size={20} />
          </Link>
          <div className="flex-1">
            <SearchInput
              placeholder="아티스트 이름, 도시 검색"
            />
          </div>
        </div>
        {/* 결과 내 필터 — 태그·타입 */}
        {sp.q && (
          <ResultFilterBar
            initialTags={sp.tags}
            initialType={sp.type}
            query={sp.q}
          />
        )}
      </header>

      <Suspense fallback={<FeedSkeleton />}>
        <SearchResults q={sp.q} tags={sp.tags} type={sp.type} />
      </Suspense>
    </PageContainer>
  );
}
