/**
 * GET /api/discover/city?city=Seoul&country=KR
 *
 * 선택 도시 기준으로 Guest/Based 아티스트 피드 반환.
 * HomeFeedClient의 도시 변경 시 호출됨.
 */
import { NextResponse, type NextRequest } from "next/server";
import { getCityArtists, type SearchResult } from "@/lib/queries/artists";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { toCitySlug } from "@/lib/mock-preferences";
import type { FeedCard } from "@/types";

function toFeedCards(
  results: SearchResult[],
  followingIds: Set<string>
): FeedCard[] {
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

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const city    = searchParams.get("city");
  const country = searchParams.get("country") ?? "";

  if (!city) {
    return NextResponse.json({ error: "city is required" }, { status: 400 });
  }

  // 로그인 사용자 세션 확인 — 실패해도 도시 조회 자체는 계속 진행
  let followingIds = new Set<string>();
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const admin = getSupabaseAdminClient();
      const { data: followRows } = await admin
        .from("follows")
        .select("artist_id")
        .eq("follower_id", user.id);

      if (followRows) {
        followingIds = new Set(followRows.map((r) => r.artist_id));
      }
    }
  } catch (err) {
    // 인증 조회 실패는 전체 응답 실패로 이어지지 않음
    console.error("[/api/discover/city] follow 상태 조회 실패:", err);
  }

  try {
    const { guests, based } = await getCityArtists(city);
    const guestItems = toFeedCards(guests, followingIds).slice(0, 8);
    const basedItems = toFeedCards(based, followingIds).slice(0, 3);
    const citySlug   = toCitySlug(city, country);

    return NextResponse.json({ guestItems, basedItems, citySlug });
  } catch (err) {
    console.error("[/api/discover/city] 조회 실패:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
