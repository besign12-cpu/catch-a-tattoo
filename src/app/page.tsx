import { Suspense } from "react";
import type { Metadata } from "next";

import { PageContainer } from "@/components/layout/PageContainer";
import { FeedSkeleton } from "@/components/ui/Skeleton";
import { HomeFeedClient } from "@/components/home/HomeFeedClient";

import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getCityArtists, type SearchResult } from "@/lib/queries/artists";
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
        id:              r.artistId,
        displayName:     r.displayName,
        instagramHandle: r.instagramHandle ?? "",
        isVerified:      r.isVerified,
        isClaimed:       r.isClaimed,
        baseCity:        r.baseCity ?? "",
        tags:            r.tags,
      },
      schedule:    r.nextSchedule!,
      isFollowing: false,
    }));
}

async function FeedSection() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 로그인 유저의 base_city/country 조회
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

  // 피드 조회 — 빈 결과는 빈 결과로 표시 (DUMMY_FEED 사용 안 함)
  let guestItems: FeedCard[] = [];
  let basedItems: FeedCard[] = [];

  try {
    const { guests, based } = await getCityArtists(baseCity);
    guestItems = toFeedCards(guests)
      .slice(0, 8)
      .map((item) => ({
        ...item,
        isFollowing: followingArtistIds.has(item.artist.id),
      }));
    basedItems = toFeedCards(based)
      .slice(0, 3)
      .map((item) => ({
        ...item,
        isFollowing: followingArtistIds.has(item.artist.id),
      }));
  } catch (err) {
    console.error("[Discover] getCityArtists 실패:", err);
    // 에러 시 빈 결과 유지 (더미 데이터 표시 안 함)
  }

  // cities 마스터 조회 (도시 검색/변경용)
  const admin = getSupabaseAdminClient();
  const { data: citiesData } = await admin
    .from("cities")
    .select("id, name, country, country_name, region")
    .eq("is_approved", true)
    .order("name", { ascending: true });

  const cities = (citiesData ?? []).map(
    (c: {
      id: string;
      name: string;
      country: string;
      country_name: string;
      region: string;
    }) => ({
      id:          c.id,
      name:        c.name,
      country:     c.country,
      countryName: c.country_name,
      region:      c.region,
    })
  );

  return (
    <HomeFeedClient
      guestItems={guestItems}
      basedItems={basedItems}
      baseCity={baseCity}
      baseCountry={baseCountry}
      citySlug={citySlug}
      isLoggedIn={!!user}
      cities={cities}
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
