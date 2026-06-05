/* eslint-disable @typescript-eslint/no-explicit-any */
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

type ArtistProfileRow =
  Database["public"]["Tables"]["artist_profiles"]["Row"];

export interface StudioArtistProfile {
  id: string;
  userId: string | null;
  displayName: string;
  instagramHandle: string | null;
  bio: string | null;
  baseCity: string | null;
  baseCountry: string | null;
  isClaimed: boolean;
  isVerified: boolean;
  contactType: "instagram" | "email" | "website";
  contactValue: string | null;
  createdAt: string;
}

function toStudioProfile(row: ArtistProfileRow): StudioArtistProfile {
  return {
    id: row.id,
    userId: row.user_id,
    displayName: row.display_name,
    instagramHandle: row.instagram_handle,
    bio: row.bio,
    baseCity: row.base_city,
    baseCountry: row.base_country,
    isClaimed: row.is_claimed,
    isVerified: row.is_verified,
    contactType: row.contact_type,
    contactValue: row.contact_value,
    createdAt: row.created_at,
  };
}

/**
 * 로그인된 userId에 연결된 아티스트 프로필 조회
 * Server Component / Server Action 전용
 */
export async function getMyArtistProfile(
  userId: string
): Promise<StudioArtistProfile | null> {
  const supabase = await getSupabaseServerClient();

  const { data, error } = await supabase
    .from("artist_profiles")
    .select(
      "id, user_id, display_name, instagram_handle, bio, " +
        "base_city, base_country, is_claimed, is_verified, " +
        "contact_type, contact_value, created_at"
    )
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) return null;

  const row = data as any as ArtistProfileRow;
  return toStudioProfile(row);
}
