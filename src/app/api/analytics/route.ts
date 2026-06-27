/**
 * POST /api/analytics
 *
 * Client Component에서 analytics 이벤트 수집 시 호출.
 * Server Action 대신 Route Handler 사용 → 재렌더 없음.
 *
 * body: {
 *   type: "demand" | "search"
 *
 *   // demand
 *   eventType?: "profile_view" | "instagram_click" | "city_click" | "schedule_view"
 *   artistId?:  string
 *   cityName?:  string
 *
 *   // search
 *   queryType?: "artist" | "style" | "city" | "combined"
 *   query?:     string
 *   tags?:      string[]
 *   resultCount?: number
 * }
 */
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import {
  collectProfileView,
  collectInstagramClick,
  collectCityClick,
  collectScheduleView,
  collectArtistSearch,
  collectStyleSearch,
  collectCitySearch,
  collectCombinedSearch,
} from "@/lib/analytics/collect";

export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id ?? null;

    const body = await request.json() as {
      type: "demand" | "search";
      eventType?: string;
      queryType?: string;
      artistId?: string;
      cityName?: string;
      query?: string;
      tags?: string[];
      resultCount?: number;
    };

    if (body.type === "demand") {
      switch (body.eventType) {
        case "profile_view":
          if (body.artistId) {
            await collectProfileView({ artistId: body.artistId, userId, cityName: body.cityName });
          }
          break;
        case "instagram_click":
          if (body.artistId) {
            await collectInstagramClick({ artistId: body.artistId, userId });
          }
          break;
        case "city_click":
          if (body.cityName) {
            await collectCityClick({ cityName: body.cityName, userId });
          }
          break;
        case "schedule_view":
          if (body.artistId) {
            await collectScheduleView({ artistId: body.artistId, cityName: body.cityName, userId });
          }
          break;
      }
    } else if (body.type === "search") {
      const count = body.resultCount ?? 0;
      switch (body.queryType) {
        case "artist":
          if (body.query) await collectArtistSearch({ query: body.query, resultCount: count, userId });
          break;
        case "style":
          if (body.tags?.length) await collectStyleSearch({ tags: body.tags, resultCount: count, userId });
          break;
        case "city":
          if (body.query) await collectCitySearch({ query: body.query, resultCount: count, userId });
          break;
        case "combined":
          await collectCombinedSearch({
            query: body.query ?? "",
            tags: body.tags ?? [],
            resultCount: count,
            userId,
          });
          break;
      }
    }

    return NextResponse.json({ ok: true });
  } catch {
    // 수집 실패는 조용히 처리 — 클라이언트에 에러 노출 안 함
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
