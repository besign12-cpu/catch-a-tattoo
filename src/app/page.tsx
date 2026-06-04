import { Suspense } from "react";
import type { Metadata } from "next";

import { PageContainer } from "@/components/layout/PageContainer";
import { FeedSkeleton } from "@/components/ui/Skeleton";
import { HomeFeedClient } from "@/components/home/HomeFeedClient";

import { getCityArtists, type SearchResult } from "@/lib/queries/artists";
import { DUMMY_FEED } from "@/data/dummy";
import { MOCK_BASE_CITY, MOCK_BASE_COUNTRY, toCitySlug } from "@/lib/mock-preferences";
import type { FeedCard } from "@/types";

export const metadata: Metadata = { title: "Catch A Tattoo" };
export const revalidate = 30;

/** SearchResult → FeedCard 변환 (nextSchedule 있는 항목만) */
function toFeedCards(results: SearchResult[]): FeedCard[] {
  return results
    .filter((r) => r.nextSchedule !== null)
    .map((r) => ({
      artist: {
        id: r.artistId,
        displayName: r.displayName,
        instagramHandle: r.instagramHandle ?? "",
        isVerified: r.isVerified,
        isClaimed: r.isClaimed,
        baseCity: r.baseCity ?? "",
        tags: r.tags,
      },
      schedule: r.nextSchedule!,
      isFollowing: false,
    }));
}

async function fetchHomeSections(): Promise<{
  guestItems: FeedCard[];
  basedItems: FeedCard[];
}> {
  try {
    const { guests, based } = await getCityArtists(MOCK_BASE_CITY);
    const guestItems = toFeedCards(guests).slice(0, 8);
    const basedItems = toFeedCards(based).slice(0, 3);

    if (guestItems.length === 0 && basedItems.length === 0) {
      return {
        guestItems: DUMMY_FEED.slice(0, 8),
        basedItems: DUMMY_FEED.slice(0, 3),
      };
    }
    return { guestItems, basedItems };
  } catch {
    return {
      guestItems: DUMMY_FEED.slice(0, 8),
      basedItems: DUMMY_FEED.slice(0, 3),
    };
  }
}

async function FeedSection() {
  const { guestItems, basedItems } = await fetchHomeSections();
  const citySlug = toCitySlug(MOCK_BASE_CITY, MOCK_BASE_COUNTRY);

  return (
    <HomeFeedClient
      guestItems={guestItems}
      basedItems={basedItems}
      baseCity={MOCK_BASE_CITY}
      citySlug={citySlug}
    />
  );
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
