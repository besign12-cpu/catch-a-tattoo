/**
 * Analytics 수집 함수
 *
 * 원칙:
 * - Fire-and-forget: 수집 실패해도 UX 영향 없음
 * - Server-side: demand_events / search_logs INSERT
 * - session_id: 호출 시점 crypto.randomUUID() (요청 단위)
 * - city_id: cities 마스터에서 name 조회 (없으면 null)
 *
 * 수집 대상:
 * demand_events — profile_view / instagram_click / city_click / schedule_view
 * search_logs   — artist / style / city / combined
 */

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Database, Json } from "@/types/database.types";

type DemandEventInsert =
  Database["public"]["Tables"]["demand_events"]["Insert"];
type SearchLogInsert =
  Database["public"]["Tables"]["search_logs"]["Insert"];

type DemandEventType =
  Database["public"]["Tables"]["demand_events"]["Row"]["event_type"];
type SearchQueryType =
  Database["public"]["Tables"]["search_logs"]["Row"]["query_type"];

// ── city_id 조회 헬퍼 ─────────────────────────────────────────

async function getCityId(cityName: string | null | undefined): Promise<string | null> {
  if (!cityName) return null;
  try {
    const admin = getSupabaseAdminClient();
    const { data } = await admin
      .from("cities")
      .select("id")
      .eq("name", cityName)
      .maybeSingle();
    return (data as { id: string } | null)?.id ?? null;
  } catch {
    return null;
  }
}

// ── demand_events INSERT ──────────────────────────────────────

async function insertDemandEvent(
  eventType: DemandEventType,
  opts: {
    userId?: string | null;
    artistId?: string | null;
    cityName?: string | null;
  } = {}
): Promise<void> {
  try {
    const admin = getSupabaseAdminClient();
    const cityId = await getCityId(opts.cityName);

    const row: DemandEventInsert = {
      event_type:  eventType,
      user_id:     opts.userId  ?? null,
      artist_id:   opts.artistId ?? null,
      city_id:     cityId,
      session_id:  crypto.randomUUID(),
    };

    await admin.from("demand_events").insert(row);
  } catch {
    // fire-and-forget: 수집 실패 무시
  }
}

// ── search_logs INSERT ────────────────────────────────────────

async function insertSearchLog(
  queryType: SearchQueryType,
  opts: {
    queryValue?: string | null;
    userId?: string | null;
    resultCount?: number;
    filtersUsed?: Json;
  } = {}
): Promise<void> {
  try {
    const admin = getSupabaseAdminClient();

    const row: SearchLogInsert = {
      query_type:   queryType,
      query_value:  opts.queryValue  ?? null,
      user_id:      opts.userId      ?? null,
      session_id:   crypto.randomUUID(),
      result_count: opts.resultCount ?? 0,
      filters_used: opts.filtersUsed ?? {},
    };

    await admin.from("search_logs").insert(row);
  } catch {
    // fire-and-forget: 수집 실패 무시
  }
}

// ── 공개 수집 함수 ────────────────────────────────────────────

/** Artist Profile 조회 이벤트 */
export async function collectProfileView(opts: {
  artistId: string;
  userId?: string | null;
  cityName?: string | null;
}): Promise<void> {
  await insertDemandEvent("profile_view", {
    artistId: opts.artistId,
    userId:   opts.userId,
    cityName: opts.cityName,
  });
}

/** Instagram 링크 클릭 이벤트 */
export async function collectInstagramClick(opts: {
  artistId: string;
  userId?: string | null;
}): Promise<void> {
  await insertDemandEvent("instagram_click", {
    artistId: opts.artistId,
    userId:   opts.userId,
  });
}

/** City Page 조회 이벤트 */
export async function collectCityClick(opts: {
  cityName: string;
  userId?: string | null;
}): Promise<void> {
  await insertDemandEvent("city_click", {
    cityName: opts.cityName,
    userId:   opts.userId,
  });
}

/** Guest Work 일정 클릭 (schedule_view) */
export async function collectScheduleView(opts: {
  artistId: string;
  cityName?: string | null;
  userId?: string | null;
}): Promise<void> {
  await insertDemandEvent("schedule_view", {
    artistId: opts.artistId,
    cityName: opts.cityName,
    userId:   opts.userId,
  });
}

/** 아티스트 검색 */
export async function collectArtistSearch(opts: {
  query: string;
  resultCount: number;
  userId?: string | null;
}): Promise<void> {
  await insertSearchLog("artist", {
    queryValue:  opts.query,
    userId:      opts.userId,
    resultCount: opts.resultCount,
  });
}

/** 스타일/태그 필터 사용 */
export async function collectStyleSearch(opts: {
  tags: string[];
  resultCount: number;
  userId?: string | null;
}): Promise<void> {
  await insertSearchLog("style", {
    queryValue:  opts.tags.join(","),
    userId:      opts.userId,
    resultCount: opts.resultCount,
    filtersUsed: { tags: opts.tags } as Json,
  });
}

/** 도시 검색 */
export async function collectCitySearch(opts: {
  query: string;
  resultCount: number;
  userId?: string | null;
}): Promise<void> {
  await insertSearchLog("city", {
    queryValue:  opts.query,
    userId:      opts.userId,
    resultCount: opts.resultCount,
  });
}

/** 복합 검색 (텍스트 + 필터 조합) */
export async function collectCombinedSearch(opts: {
  query: string;
  tags: string[];
  resultCount: number;
  userId?: string | null;
}): Promise<void> {
  await insertSearchLog("combined", {
    queryValue:  opts.query,
    userId:      opts.userId,
    resultCount: opts.resultCount,
    filtersUsed: { tags: opts.tags } as Json,
  });
}
