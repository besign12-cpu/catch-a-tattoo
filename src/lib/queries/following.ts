/**
 * following.ts — Following 페이지 실데이터 쿼리
 *
 * follows 테이블 기준:
 * - 내가 팔로우한 아티스트 목록
 * - 그 아티스트들의 미래/진행 중 Guest Work 일정
 *   조건: end_date >= today AND is_active = true
 */

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type {
  FollowingScheduleItem,
  FollowingArtistItem,
} from "@/app/following/FollowingClient";

export async function getFollowingData(userId: string): Promise<{
  schedules: FollowingScheduleItem[];
  artists: FollowingArtistItem[];
}> {
  const admin = getSupabaseAdminClient();

  // 1. 내가 팔로우한 아티스트 ID 목록
  const { data: followRows, error: followErr } = await admin
    .from("follows")
    .select("artist_id")
    .eq("follower_id", userId);

  if (followErr) {
    console.error("[getFollowingData] follows 조회 실패:", followErr.message);
    return { schedules: [], artists: [] };
  }

  if (!followRows || followRows.length === 0) {
    return { schedules: [], artists: [] };
  }

  const artistIds = followRows.map((r) => r.artist_id);

  // 2. 아티스트 프로필 조회
  const { data: profileRows, error: profileErr } = await admin
    .from("artist_profiles")
    .select(`
      id,
      display_name,
      instagram_handle,
      is_verified,
      base_city,
      base_country
    `)
    .in("id", artistIds)
    .order("display_name", { ascending: true });

  if (profileErr) {
    console.error("[getFollowingData] artist_profiles 조회 실패:", profileErr.message);
    return { schedules: [], artists: [] };
  }

  // 3. 미래/진행 중 Guest Work 일정 조회
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  const { data: scheduleRows, error: scheduleErr } = await admin
    .from("guest_schedules")
    .select(`
      id,
      artist_id,
      city,
      country,
      start_date,
      end_date,
      is_active
    `)
    .in("artist_id", artistIds)
    .gte("end_date", today)      // 종료된 일정 제외
    .eq("is_active", true)       // 취소/삭제 제외
    .order("start_date", { ascending: true });

  if (scheduleErr) {
    console.error("[getFollowingData] guest_schedules 조회 실패:", scheduleErr.message);
    // 일정 조회 실패해도 아티스트 목록은 반환
  }

  // profileId → profile 맵
  type ProfileRow = {
    id: string;
    display_name: string;
    instagram_handle: string | null;
    is_verified: boolean;
    base_city: string | null;
    base_country: string | null;
  };

  const profileMap = new Map<string, ProfileRow>(
    (profileRows ?? []).map((p) => [p.id, p as unknown as ProfileRow])
  );

  // artists 변환
  const artists: FollowingArtistItem[] = (profileRows ?? []).map((p) => {
    const profile = p as unknown as ProfileRow;
    return {
      id:              profile.id,
      displayName:     profile.display_name,
      instagramHandle: profile.instagram_handle ?? profile.id,
      isVerified:      profile.is_verified,
      baseCity:        profile.base_city,
      baseCountry:     profile.base_country,
    };
  });

  // schedules 변환
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);

  const schedules: FollowingScheduleItem[] = (scheduleRows ?? [])
    .map((s) => {
      const profile = profileMap.get(s.artist_id);
      if (!profile) return null;

      const startDate = new Date(s.start_date);
      const endDate   = new Date(s.end_date);
      endDate.setHours(23, 59, 59, 999);
      const isCurrentlyActive = todayDate >= startDate && todayDate <= endDate;

      return {
        id:           s.id,
        artistId:     s.artist_id,
        artistName:   profile.display_name,
        artistHandle: profile.instagram_handle ?? s.artist_id,
        isVerified:   profile.is_verified,
        city:         s.city,
        country:      s.country,
        startDate:    s.start_date,
        endDate:      s.end_date,
        isActive:     isCurrentlyActive,
      } satisfies FollowingScheduleItem;
    })
    .filter((s): s is FollowingScheduleItem => s !== null);

  return { schedules, artists };
}
