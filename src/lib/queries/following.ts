/**
 * Following 페이지 쿼리
 *
 * follows 테이블 기준으로:
 * - 내가 팔로우한 아티스트 목록 (artist_profiles + artist_tags + tags JOIN)
 * - 그 아티스트들의 Guest Work 일정 (guest_schedules, active/upcoming만)
 */

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { FollowingScheduleItem, FollowingArtistItem } from "@/app/following/FollowingClient";

// ── getFollowingData ──────────────────────────────────────────

export async function getFollowingData(userId: string): Promise<{
  schedules: FollowingScheduleItem[];
  artists: FollowingArtistItem[];
}> {
  const admin = getSupabaseAdminClient();

  // 1. 내가 팔로우한 아티스트 ID 목록
  const { data: followRows } = await admin
    .from("follows")
    .select("artist_id")
    .eq("follower_id", userId);

  if (!followRows || followRows.length === 0) {
    return { schedules: [], artists: [] };
  }

  const artistIds = followRows.map((r) => r.artist_id);

  // 2. 아티스트 프로필 + 태그 조회
  const { data: profileRows } = await admin
    .from("artist_profiles")
    .select(`
      id,
      display_name,
      instagram_handle,
      is_verified,
      base_city,
      base_country,
      artist_tags (
        tag_id,
        tags ( id, name, slug, group_type )
      )
    `)
    .in("id", artistIds)
    .order("display_name", { ascending: true });

  // 3. 팔로우 아티스트들의 active/upcoming Guest Work 일정 조회
  const today = new Date().toISOString().split("T")[0];

  const { data: scheduleRows } = await admin
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
    .gte("end_date", today)        // ended 제외
    .eq("is_active", true)
    .order("start_date", { ascending: true });

  // 아티스트 ID → 프로필 맵
  type ProfileRow = {
    id: string;
    display_name: string;
    instagram_handle: string | null;
    is_verified: boolean;
    base_city: string | null;
    base_country: string | null;
    artist_tags: {
      tag_id: string;
      tags: { id: string; name: string; slug: string; group_type: string } | null;
    }[];
  };

  const profileMap = new Map<string, ProfileRow>(
    (profileRows ?? []).map((p) => [p.id, p as unknown as ProfileRow])
  );

  // ── artists 변환 ──────────────────────────────────────────

  const artists: FollowingArtistItem[] = (profileRows ?? []).map((p) => {
    const profile = p as unknown as ProfileRow;
    const tags = (profile.artist_tags ?? [])
      .map((at) => at.tags)
      .filter((t): t is NonNullable<typeof t> => t !== null)
      .map((t) => ({
        id: t.id,
        name: t.name,
        slug: t.slug,
        group: t.group_type as "color" | "main" | "art",
      }));

    return {
      id: profile.id,
      displayName: profile.display_name,
      instagramHandle: profile.instagram_handle ?? profile.id,
      isVerified: profile.is_verified,
      baseCity: profile.base_city,
      baseCountry: profile.base_country,
      tags,
    };
  });

  // ── schedules 변환 ────────────────────────────────────────

  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);

  const schedules: FollowingScheduleItem[] = (scheduleRows ?? [])
    .map((s) => {
      const profile = profileMap.get(s.artist_id);
      if (!profile) return null;

      const startDate = new Date(s.start_date);
      const endDate   = new Date(s.end_date);
      endDate.setHours(23, 59, 59, 999);
      const isCurrentlyActive =
        todayDate >= startDate && todayDate <= endDate;

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
