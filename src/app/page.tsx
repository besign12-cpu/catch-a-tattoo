import { Suspense } from "react";
import type { Metadata } from "next";

import { PageContainer } from "@/components/layout/PageContainer";
import { FeedSkeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { HomeFeedClient } from "@/components/home/HomeFeedClient";

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

  return <HomeFeedClient items={items} />;
}

export default function HomePage() {
  return (
    <PageContainer>
      <Suspense fallback={<FeedSkeleton />}>
        <FeedSection />
      </Suspense>
    </PageContainer>
  );
}
