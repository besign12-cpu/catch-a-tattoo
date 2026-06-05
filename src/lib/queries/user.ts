/* eslint-disable @typescript-eslint/no-explicit-any */
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

// DB Row 타입 직접 참조
type UserRow = Database["public"]["Tables"]["users"]["Row"];
type ArtistProfileRow = Database["public"]["Tables"]["artist_profiles"]["Row"];

export interface UserProfile {
  id: string;
  email: string;
  username: string | null;
  avatarUrl: string | null;
  role: "customer" | "artist" | "admin";
  baseCity: string | null;
  baseCountry: string | null;
  createdAt: string;
  /** 연결된 아티스트 프로필 핸들 (instagram_handle). 없으면 null */
  artistHandle: string | null;
}

// ── 변환 헬퍼 ──────────────────────────────────────────────────

function toUserProfile(
  row: UserRow,
  artistHandle: string | null
): UserProfile {
  return {
    id: row.id,
    email: row.email,
    username: row.username,
    avatarUrl: row.avatar_url,
    role: row.role,
    baseCity: row.base_city,
    baseCountry: row.base_country,
    createdAt: row.created_at,
    artistHandle,
  };
}

// ── 쿼리 ──────────────────────────────────────────────────────

/**
 * 로그인된 userId 기준으로 users 테이블 + artist_profiles 조회
 * Server Component / Server Action 전용
 */
export async function getUserProfile(
  userId: string
): Promise<UserProfile | null> {
  const supabase = await getSupabaseServerClient();

  // users 테이블 조회 — artists.ts와 동일하게 data as any 처리
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("id, email, username, avatar_url, role, base_city, base_country, created_at")
    .eq("id", userId)
    .single();

  if (userError || !userData) return null;

  const row = userData as any as UserRow;

  // artist_profiles — select("*") 후 as any 처리 (컬럼 파싱 never 회피)
  const { data: artistData } = await supabase
    .from("artist_profiles")
    .select("instagram_handle")
    .eq("user_id", userId)
    .maybeSingle();

  const artistRow = artistData as any as Pick<ArtistProfileRow, "instagram_handle"> | null;
  const artistHandle = artistRow?.instagram_handle ?? null;

  return toUserProfile(row, artistHandle);
}
