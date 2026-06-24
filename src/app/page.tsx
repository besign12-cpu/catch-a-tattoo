import { Suspense } from "react";
import type { Metadata } from "next";

import { PageContainer } from "@/components/layout/PageContainer";
import { FeedSkeleton } from "@/components/ui/Skeleton";
import { HomeFeedClient } from "@/components/home/HomeFeedClient";

import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
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

async function FeedSection() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let baseCity    = DEFAULT_BASE_CITY;
  let baseCountry = DEFAULT_BASE_COUNTRY;
  let followingArtistIds = new Set<string>();

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

    // 팔로우 중인 아티스트 ID 목록 조회
    const admin = getSupabaseAdminClient();
    const { data: followRows } = await admin
      .from("follows")
      .select("artist_id")
      .eq("follower_id", user.id);

    if (followRows) {
      followingArtistIds = new Set(followRows.map((r) => r.artist_id));
    }
  }

  const citySlug = toCitySlug(baseCity, baseCountry);

  /** SearchResult → FeedCard 변환 (isFollowing 실데이터 반영) */
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
        isFollowing: followingArtistIds.has(r.artistId),
      }));
  }

  let guestItems: FeedCard[] = [];
  let basedItems: FeedCard[] = [];

  try {
    const { guests, based } = await getCityArtists(baseCity);
    guestItems = toFeedCards(guests).slice(0, 8);
    basedItems = toFeedCards(based).slice(0, 3);

    if (guestItems.length === 0 && basedItems.length === 0) {
      guestItems = DUMMY_FEED.slice(0, 8);
      basedItems = DUMMY_FEED.slice(0, 3);
    }
  } catch {
    guestItems = DUMMY_FEED.slice(0, 8);
    basedItems = DUMMY_FEED.slice(0, 3);
  }

  return (
    <HomeFeedClient
      guestItems={guestItems}
      basedItems={basedItems}
      baseCity={baseCity}
      citySlug={citySlug}
      isLoggedIn={!!user}
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
