import { Suspense } from "react";
import { Bell, Search } from "lucide-react";
import type { Metadata } from "next";

import { PageContainer } from "@/components/layout/PageContainer";
import { FeedCard } from "@/components/artist/FeedCard";
import { CityFilterBar } from "@/components/search/CityFilterBar";
import { FeedSkeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";

import { getFeedSchedules } from "@/lib/queries/artists";
import { DUMMY_FEED } from "@/data/dummy";

export const metadata: Metadata = { title: "홈" };
export const revalidate = 30;

async function FeedSection() {
  let items = await getFeedSchedules().catch(() => null);

  if (!items || items.length === 0) {
    items = DUMMY_FEED;
  }

  if (items.length === 0) {
    return (
      <div className="px-3 pt-4">
        <ErrorState type="generic" message="표시할 일정이 없습니다" compact />
      </div>
    );
  }

  const following = items.filter((f) => f.isFollowing);
  const discover  = items.filter((f) => !f.isFollowing);

  return (
    <div className="space-y-2.5 px-3 py-2">
      {following.length > 0 && (
        <>
          <p className="text-[10px] font-medium uppercase tracking-widest text-neutral-400">
            팔로우 중 — 새 일정
          </p>
          {following.map((item) => (
            <FeedCard key={item.schedule.id} data={item} />
          ))}
        </>
      )}
      {discover.length > 0 && (
        <>
          <p className={following.length > 0 ? "mt-4 text-[10px] font-medium uppercase tracking-widest text-neutral-400" : "text-[10px] font-medium uppercase tracking-widest text-neutral-400"}>
            다가오는 게스트워크
          </p>
          {discover.map((item) => (
            <FeedCard key={item.schedule.id} data={item} />
          ))}
        </>
      )}
    </div>
  );
}

export default function HomePage() {
  return (
    <PageContainer>
      <header className="sticky top-0 z-40 border-b border-neutral-100 bg-white">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <p className="text-[11px] text-neutral-400">안녕하세요 👋</p>
            <p className="text-[17px] font-medium text-neutral-900 leading-tight">게스트 일정 찾기</p>
          </div>
          <div className="relative">
            <Bell size={22} strokeWidth={1.5} className="text-neutral-700" aria-label="알림" />
            <span className="absolute -right-0.5 -top-0.5 h-[7px] w-[7px] rounded-full bg-red-500" aria-hidden="true" />
          </div>
        </div>
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5">
            <Search size={15} className="shrink-0 text-neutral-400" aria-hidden="true" />
            <span className="text-[13px] text-neutral-400">도시, 아티스트, 태그 검색</span>
          </div>
        </div>
        <CityFilterBar />
      </header>
      <Suspense fallback={<FeedSkeleton />}>
        <FeedSection />
      </Suspense>
    </PageContainer>
  );
}
