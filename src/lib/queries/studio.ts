/* eslint-disable @typescript-eslint/no-explicit-any */
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";
import type { Tag } from "@/types";

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
  tags: Tag[];
}

// ── 변환 헬퍼 ──────────────────────────────────────────────────

function toTag(raw: {
  id: string;
  name: string;
  slug: string;
  group_type: string;
}): Tag {
  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    group: raw.group_type as Tag["group"],
  };
}

function toStudioProfile(row: ArtistProfileRow, tags: Tag[]): StudioArtistProfile {
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
    tags,
  };
}

// ── 쿼리 ──────────────────────────────────────────────────────

/**
 * 로그인된 userId에 연결된 아티스트 프로필 + 태그 조회
 * Server Component / Server Action 전용
 */
export async function getMyArtistProfile(
  userId: string
): Promise<StudioArtistProfile | null> {
  const supabase = await getSupabaseServerClient();

  const { data, error } = await supabase
    .from("artist_profiles")
    .select(
      `
      id, user_id, display_name, instagram_handle, bio,
      base_city, base_country, is_claimed, is_verified,
      contact_type, contact_value, created_at,
      artist_tags ( tags ( id, name, slug, group_type ) )
      `
    )
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) return null;

  const row = data as any as ArtistProfileRow;

  const tags: Tag[] =
    (data as any).artist_tags
      ?.flatMap(
        (at: {
          tags: {
            id: string;
            name: string;
            slug: string;
            group_type: string;
          } | null;
        }) => (at.tags ? [toTag(at.tags)] : [])
      ) ?? [];

  return toStudioProfile(row, tags);
}
