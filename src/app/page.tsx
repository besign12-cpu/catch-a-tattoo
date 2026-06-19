import { Suspense } from "react";
import type { Metadata } from "next";

import { PageContainer } from "@/components/layout/PageContainer";
import { FeedSkeleton } from "@/components/ui/Skeleton";
import { HomeFeedClient } from "@/components/home/HomeFeedClient";

import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getCityArtists, type SearchResult } from "@/lib/queries/artists";
import { DUMMY_FEED } from "@/data/dummy";
import {
  DEFAULT_BASE_CITY,
  DEFAULT_BASE_COUNTRY,
  toCitySlug,
} from "@/lib/mock-preferences";
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

async function fetchHomeSections(baseCity: string): Promise<{
  guestItems: FeedCard[];
  basedItems: FeedCard[];
}> {
  try {
    const { guests, based } = await getCityArtists(baseCity);
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
  // 로그인 유저의 base_city 조회 — 비로그인 또는 미설정 시 DEFAULT_BASE_CITY 사용
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let baseCity    = DEFAULT_BASE_CITY;
  let baseCountry = DEFAULT_BASE_COUNTRY;

  if (user) {
    const { data: userData } = await supabase
      .from("users")
      .select("base_city, base_country")
      .eq("id", user.id)
      .single();

    if (userData?.base_city) {
      baseCity    = userData.base_city;
      baseCountry = userData.base_country ?? DEFAULT_BASE_COUNTRY;
    }
  }

  const citySlug = toCitySlug(baseCity, baseCountry);
  const { guestItems, basedItems } = await fetchHomeSections(baseCity);

  return (
    <HomeFeedClient
      guestItems={guestItems}
      basedItems={basedItems}
      baseCity={baseCity}
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
