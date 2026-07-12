/**
 * GET /api/discover/city?city=Seoul&country=KR
 *
 * 선택 도시 기준으로 Guest/Based 아티스트 피드 반환.
 * HomeFeedClient의 도시 변경 시 호출됨.
 */
import { NextResponse, type NextRequest } from "next/server";
import { getCityArtists, type SearchResult } from "@/lib/queries/artists";
import { toCitySlug } from "@/lib/mock-preferences";
import type { FeedCard } from "@/types";

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

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const city    = searchParams.get("city");
  const country = searchParams.get("country") ?? "";

  if (!city) {
    return NextResponse.json({ error: "city is required" }, { status: 400 });
  }

  try {
    const { guests, based } = await getCityArtists(city);
    const guestItems = toFeedCards(guests).slice(0, 8);
    const basedItems = toFeedCards(based).slice(0, 3);
    const citySlug   = toCitySlug(city, country);

    return NextResponse.json({ guestItems, basedItems, citySlug });
  } catch (err) {
    console.error("[/api/discover/city] 조회 실패:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
