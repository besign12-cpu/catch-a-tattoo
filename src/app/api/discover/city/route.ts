/**
 * GET /api/discover/city?city=Tokyo&country=JP
 *
 * Discover 도시 전환 시 클라이언트에서 호출.
 * 해당 도시의 Guest/Based 아티스트 피드 반환.
 */
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getCityArtists, type SearchResult } from "@/lib/queries/artists";
import { toCitySlug } from "@/lib/mock-preferences";
import type { FeedCard } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city    = searchParams.get("city")?.trim();
    const country = searchParams.get("country")?.trim() ?? "";

    if (!city) {
      return NextResponse.json({ error: "city 파라미터 필요" }, { status: 400 });
    }

    // 로그인 유저의 팔로우 목록 조회 (isFollowing 반영)
    const supabase = await getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    let followingArtistIds = new Set<string>();
    if (user) {
      const admin = getSupabaseAdminClient();
      const { data: followRows } = await admin
        .from("follows")
        .select("artist_id")
        .eq("follower_id", user.id);
      if (followRows) {
        followingArtistIds = new Set(followRows.map((r) => r.artist_id));
      }
    }

    const { guests, based } = await getCityArtists(city);
    const guestItems = toFeedCards(guests, followingArtistIds).slice(0, 8);
    const basedItems = toFeedCards(based,  followingArtistIds).slice(0, 3);
    const citySlug   = toCitySlug(city, country);

    return NextResponse.json({ guestItems, basedItems, citySlug });
  } catch {
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}

function toFeedCards(results: SearchResult[], followingIds: Set<string>): FeedCard[] {
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
      isFollowing: followingIds.has(r.artistId),
    }));
}
