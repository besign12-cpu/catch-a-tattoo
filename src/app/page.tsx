import { Suspense } from "react";
import { Bell, Search } from "lucide-react";
import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/PageContainer";
import { FeedCard } from "@/components/artist/FeedCard";
import { CityFilterBar } from "@/components/search/CityFilterBar";
import { FeedSkeleton } from "@/components/ui/Skeleton";
import { DUMMY_FEED } from "@/data/dummy";

export const metadata: Metadata = {
  title: "홈",
};

function FeedSection() {
  return (
    <div className="space-y-2.5 px-3 py-2">
      <p className="text-[10px] font-medium uppercase tracking-widest text-neutral-400">
        팔로우 중 — 새 일정
      </p>
      {DUMMY_FEED.filter((f) => f.isFollowing).map((item) => (
        <FeedCard key={item.schedule.id} data={item} />
      ))}

      <p className="mt-4 text-[10px] font-medium uppercase tracking-widest text-neutral-400">
        이번 달 서울 게스트워크
      </p>
      {DUMMY_FEED.filter((f) => !f.isFollowing).map((item) => (
        <FeedCard key={item.schedule.id} data={item} />
      ))}
    </div>
  );
}

export default function HomePage() {
  return (
    <PageContainer>
      {/* 상단 헤더 */}
      <header className="sticky top-0 z-40 border-b border-neutral-100 bg-white">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <p className="text-[11px] text-neutral-400">안녕하세요 👋</p>
            <p className="text-[17px] font-medium text-neutral-900 leading-tight">
              게스트 일정 찾기
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Bell
                size={22}
                strokeWidth={1.5}
                className="text-neutral-700"
                aria-label="알림"
              />
              <span
                className="absolute -right-0.5 -top-0.5 h-[7px] w-[7px] rounded-full bg-red-500"
                aria-hidden="true"
              />
            </div>
          </div>
        </div>

        {/* 검색 인풋 */}
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5">
            <Search size={15} className="shrink-0 text-neutral-400" aria-hidden="true" />
            <span className="text-[13px] text-neutral-400">
              도시, 아티스트, 태그 검색
            </span>
          </div>
        </div>

        {/* 도시 필터 */}
        <CityFilterBar />
      </header>

      {/* 피드 */}
      <Suspense fallback={<FeedSkeleton />}>
        <FeedSection />
      </Suspense>
    </PageContainer>
  );
}
