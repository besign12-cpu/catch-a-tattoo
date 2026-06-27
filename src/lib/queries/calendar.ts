/**
 * Calendar 쿼리
 *
 * Customer Calendar:
 *   - 팔로우한 아티스트의 해당 월 Guest Work 일정
 *
 * Artist Calendar (도시별):
 *   - Guest 수 (해당 도시 active guest_schedules)
 *   - Based 아티스트 수 (해당 도시 base_city 아티스트)
 *   - My City Bring 수 (city_follows is_active=true)
 *   - 인기 스타일 (해당 도시 Guest 아티스트 태그 집계)
 */

import { getSupabaseAdminClient } from "@/lib/supabase/admin";

// ── 타입 ──────────────────────────────────────────────────────

export interface CalendarScheduleItem {
  id: string;
  artistId: string;
  artistName: string;
  artistHandle: string;
  isVerified: boolean;
  city: string;
  country: string;
  startDate: string;
  endDate: string;
}

export interface CityCalendarData {
  guestCount: number;
  basedCount: number;
  bringCount: number;
  topStyles: { name: string; count: number }[];
}

// ── getFollowingCalendar ───────────────────────────────────────
//
// Customer Calendar: 팔로우 아티스트의 year/month 일정
// 해당 월에 start_date ~ end_date가 겹치는 일정 전체 조회

export async function getFollowingCalendar(
  userId: string,
  year: number,
  month: number  // 0-indexed (JS 기준)
): Promise<CalendarScheduleItem[]> {
  const admin = getSupabaseAdminClient();

  // 팔로우 아티스트 ID
  const { data: followRows } = await admin
    .from("follows")
    .select("artist_id")
    .eq("follower_id", userId);

  if (!followRows || followRows.length === 0) return [];

  const artistIds = followRows.map((r) => r.artist_id);

  // 해당 월 범위 계산
  const monthStart = `${year}-${String(month + 1).padStart(2, "0")}-01`;
  const lastDay    = new Date(year, month + 1, 0).getDate();
  const monthEnd   = `${year}-${String(month + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

  // 해당 월에 겹치는 일정 (start_date <= monthEnd AND end_date >= monthStart)
  const { data: scheduleRows } = await admin
    .from("guest_schedules")
    .select(`
      id,
      artist_id,
      city,
      country,
      start_date,
      end_date
    `)
    .in("artist_id", artistIds)
    .eq("is_active", true)
    .lte("start_date", monthEnd)
    .gte("end_date", monthStart)
    .order("start_date", { ascending: true });

  if (!scheduleRows || scheduleRows.length === 0) return [];

  // 아티스트 프로필 조회
  const scheduleArtistIds = Array.from(
    new Set(scheduleRows.map((s) => s.artist_id))
  );
  const { data: profileRows } = await admin
    .from("artist_profiles")
    .select("id, display_name, instagram_handle, is_verified")
    .in("id", scheduleArtistIds);

  const profileMap = new Map(
    (profileRows ?? []).map((p) => [
      p.id,
      {
        name:   p.display_name,
        handle: p.instagram_handle ?? p.id,
        verified: p.is_verified,
      },
    ])
  );

  return scheduleRows.map((s) => {
    const profile = profileMap.get(s.artist_id);
    return {
      id:           s.id,
      artistId:     s.artist_id,
      artistName:   profile?.name   ?? "Unknown",
      artistHandle: profile?.handle ?? s.artist_id,
      isVerified:   profile?.verified ?? false,
      city:         s.city,
      country:      s.country,
      startDate:    s.start_date,
      endDate:      s.end_date,
    };
  });
}

// ── getCityCalendarData ────────────────────────────────────────
//
// Artist Calendar: 선택 도시의 수요 데이터
// guestCount / basedCount / bringCount / topStyles

export async function getCityCalendarData(
  cityName: string,
  userId?: string
): Promise<CityCalendarData> {
  const admin = getSupabaseAdminClient();
  const today = new Date().toISOString().split("T")[0];

  // 1. Guest 수 (active 일정)
  const { count: guestCount } = await admin
    .from("guest_schedules")
    .select("id", { count: "exact", head: true })
    .eq("city", cityName)
    .eq("is_active", true)
    .gte("end_date", today);

  // 2. Based 아티스트 수
  const { count: basedCount } = await admin
    .from("artist_profiles")
    .select("id", { count: "exact", head: true })
    .eq("base_city", cityName);

  // 3. My City Bring 수 (로그인 유저 기준 or 전체)
  let bringCount = 0;
  if (userId) {
    // 로그인: 해당 도시 활성 Bring 전체 수
    const { count } = await admin
      .from("city_follows")
      .select("id", { count: "exact", head: true })
      .eq("city", cityName)
      .eq("is_active", true);
    bringCount = count ?? 0;
  }

  // 4. 인기 스타일: 해당 도시 Guest 아티스트 태그 집계
  const { data: guestArtistRows } = await admin
    .from("guest_schedules")
    .select("artist_id")
    .eq("city", cityName)
    .eq("is_active", true)
    .gte("end_date", today);

  let topStyles: { name: string; count: number }[] = [];

  if (guestArtistRows && guestArtistRows.length > 0) {
    const guestArtistIds = Array.from(
      new Set(guestArtistRows.map((r) => r.artist_id))
    );

    // artist_tags와 tags를 별도로 조회 (관계 조인 대신 직접 조인)
    const { data: artistTagRows } = await admin
      .from("artist_tags")
      .select("tag_id")
      .in("artist_id", guestArtistIds);

    if (artistTagRows && artistTagRows.length > 0) {
      const tagIds = Array.from(new Set(artistTagRows.map((r) => r.tag_id)));

      const { data: tagRows } = await admin
        .from("tags")
        .select("id, name")
        .in("id", tagIds);

      // 태그 ID → name 맵
      const tagNameMap = new Map<string, string>(
        (tagRows ?? []).map((t) => [t.id, t.name])
      );

      // 각 아티스트가 가진 태그를 카운트
      const tagCount = new Map<string, number>();
      for (const row of artistTagRows) {
        const name = tagNameMap.get(row.tag_id);
        if (!name) continue;
        tagCount.set(name, (tagCount.get(name) ?? 0) + 1);
      }

      topStyles = Array.from(tagCount.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));
    }
  }

  return {
    guestCount:  guestCount  ?? 0,
    basedCount:  basedCount  ?? 0,
    bringCount,
    topStyles,
  };
}

// ── getCitySchedules ───────────────────────────────────────────
//
// Customer Calendar 도시 탐색용:
// 특정 도시의 해당 월 Guest Work 일정 조회 (팔로우 무관)

export async function getCitySchedules(
  cityName: string,
  year: number,
  month: number  // 0-indexed
): Promise<CalendarScheduleItem[]> {
  const admin = getSupabaseAdminClient();

  const monthStart = `${year}-${String(month + 1).padStart(2, "0")}-01`;
  const lastDay    = new Date(year, month + 1, 0).getDate();
  const monthEnd   = `${year}-${String(month + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

  const { data: scheduleRows } = await admin
    .from("guest_schedules")
    .select("id, artist_id, city, country, start_date, end_date")
    .eq("city", cityName)
    .eq("is_active", true)
    .lte("start_date", monthEnd)
    .gte("end_date", monthStart)
    .order("start_date", { ascending: true });

  if (!scheduleRows || scheduleRows.length === 0) return [];

  const artistIds = Array.from(new Set(scheduleRows.map((s) => s.artist_id)));

  const { data: profileRows } = await admin
    .from("artist_profiles")
    .select("id, display_name, instagram_handle, is_verified")
    .in("id", artistIds);

  const profileMap = new Map(
    (profileRows ?? []).map((p) => [
      p.id,
      { name: p.display_name, handle: p.instagram_handle ?? p.id, verified: p.is_verified },
    ])
  );

  return scheduleRows.map((s) => {
    const profile = profileMap.get(s.artist_id);
    return {
      id:           s.id,
      artistId:     s.artist_id,
      artistName:   profile?.name   ?? "Unknown",
      artistHandle: profile?.handle ?? s.artist_id,
      isVerified:   profile?.verified ?? false,
      city:         s.city,
      country:      s.country,
      startDate:    s.start_date,
      endDate:      s.end_date,
    };
  });
}
