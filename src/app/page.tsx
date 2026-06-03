import { Suspense } from "react";
import type { Metadata } from "next";

import { PageContainer } from "@/components/layout/PageContainer";
import { FeedCard } from "@/components/artist/FeedCard";
import { FeedSkeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { SearchInput } from "@/components/search/SearchInput";
import { CityFilterBar } from "@/components/search/CityFilterBar";

import { getFeedSchedules } from "@/lib/queries/artists";
import { DUMMY_FEED } from "@/data/dummy";

export const metadata: Metadata = { title: "Catch A Tattoo" };
export const revalidate = 30;

async function FeedSection() {
  let items = await getFeedSchedules().catch(() => null);
  if (!items || items.length === 0) items = DUMMY_FEED;

  if (items.length === 0) {
    return (
      <div className="px-3 pt-4">
        <ErrorState type="generic" message="표시할 일정이 없습니다" compact />
      </div>
    );
  }

  return (
    <div className="space-y-2.5 px-3 py-3">
      {items.map((item) => (
        <FeedCard key={item.schedule.id} data={item} />
      ))}
    </div>
  );
}

export default function HomePage() {
  return (
    <PageContainer>
      {/* 헤더 — 검색 중심 */}
      <header className="sticky top-0 z-40 border-b border-neutral-100 bg-white">
        <div className="px-4 pt-4 pb-3">
          <p className="text-[11px] text-neutral-400 mb-1">게스트워크 일정 찾기</p>
          <SearchInput className="mb-3" />
          {/* 도시 필터 — 검색 결과를 빠르게 좁히는 용도 */}
          <CityFilterBar />
        </div>
      </header>

      <Suspense fallback={<FeedSkeleton />}>
        <FeedSection />
      </Suspense>
    </PageContainer>
  );
}
