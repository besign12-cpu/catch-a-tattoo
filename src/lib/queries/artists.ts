/* eslint-disable @typescript-eslint/no-explicit-any */
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { ArtistProfile, FeedCard, GuestSchedule, Tag } from "@/types";

// ── 타입 변환 헬퍼 ──────────────────────────────────────────

function toTag(raw: { id: string; name: string; slug: string; group: string }): Tag {
  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    group: raw.group as Tag["group"],
  };
}

function toSchedule(raw: {
  id: string;
  city: string;
  country: string;
  city_lat: number;
  city_lng: number;
  region: string;
  start_date: string;
  end_date: string;
  note?: string | null;
  contact_type: string;
  contact_value?: string | null;
  is_active?: boolean;
}): GuestSchedule {
  return {
    id: raw.id,
    city: raw.city,
    country: raw.country,
    cityLat: raw.city_lat,
    cityLng: raw.city_lng,
    region: raw.region as GuestSchedule["region"],
    startDate: raw.start_date,
    endDate: raw.end_date,
    note: raw.note ?? undefined,
    contactType: raw.contact_type as GuestSchedule["contactType"],
    contactValue: raw.contact_value ?? "",
    isActive: raw.is_active ?? true,
  };
}

// ── 홈 피드 ────────────────────────────────────────────────

export async function getFeedSchedules(): Promise<FeedCard[]> {
  const supabase = await getSupabaseServerClient();

  const { data, error } = await supabase
    .from("guest_schedules")
    .select(
      `
      id, city, country, city_lat, city_lng, region,
      start_date, end_date, note,
      contact_type, contact_value, is_active,
      artist_profiles (
        id, display_name, instagram_handle,
        is_verified, is_claimed, base_city,
        artist_tags ( tags ( id, name, slug, group_type ) )
      )
    `
    )
    .eq("is_active", true)
    .gte("end_date", new Date().toISOString().split("T")[0])
    .order("start_date", { ascending: true })
    .limit(20);

  if (error || !data) return [];

  const rows = (data ?? []) as any[];
  
  return rows
  .filter((row) => row.artist_profiles !== null)
    .map((row) => {
      const ap = row.artist_profiles!;
      const tags: Tag[] =
        ap.artist_tags
          ?.flatMap((at: { tags: { id: string; name: string; slug: string; group_type: string } | null }) =>
            at.tags ? [toTag({ ...at.tags, group: at.tags.group_type })] : []
          ) ?? [];

      return {
        artist: {
          id: ap.id,
          displayName: ap.display_name,
          instagramHandle: ap.instagram_handle ?? "",
          isVerified: ap.is_verified,
          isClaimed: ap.is_claimed,
          baseCity: ap.base_city ?? "",
          tags,
        },
        schedule: toSchedule(row),
        isFollowing: false, // Sprint 3에서 세션 기반으로 교체
      } satisfies FeedCard;
    });
}

// ── 아티스트 프로필 ─────────────────────────────────────────

export async function getArtistProfile(
  handle: string
): Promise<ArtistProfile | null> {
  const supabase = await getSupabaseServerClient();

  const { data: ap, error } = await supabase
    .from("artist_profiles")
    .select(
      `
      id, user_id, display_name, instagram_handle, bio,
      base_city, base_country, city_lat, city_lng,
      is_claimed, is_verified,
      contact_type, contact_value, created_at,
      artist_tags ( tags ( id, name, slug, group_type ) ),
      portfolio_items ( id, image_url, sort_order ),
      guest_schedules (
        id, city, country, city_lat, city_lng, region,
        start_date, end_date, note,
        contact_type, contact_value, is_active
      )
    `
    )
    .eq("instagram_handle", handle)
    .single();

  if (error || !ap) return null;

  const artist = ap as any;

const tags: Tag[] =
  artist.artist_tags
      ?.flatMap((at: { tags: { id: string; name: string; slug: string; group_type: string } | null }) =>
        at.tags ? [toTag({ ...at.tags, group: at.tags.group_type })] : []
      ) ?? [];

  const portfolioItems =
    artist.portfolio_items
      ?.sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order)
      .map((p: { id: string; image_url: string; sort_order: number }) => ({
        id: p.id,
        imageUrl: p.image_url,
        sortOrder: p.sort_order,
      })) ?? [];

  const upcomingSchedules = (artist.guest_schedules ?? [])
    .filter((s: { is_active: boolean; end_date: string }) => {
      const today = new Date().toISOString().split("T")[0];
      return s.is_active && s.end_date >= today;
    })
    .sort((a: { start_date: string }, b: { start_date: string }) =>
      a.start_date.localeCompare(b.start_date)
    )
    .map(toSchedule);

  return {
    id: artist.id,
    userId: artist.user_id ?? undefined,
    displayName: artist.display_name,
    instagramHandle: artist.instagram_handle ?? "",
    bio: artist.bio ?? undefined,
    baseCity: artist.base_city ?? "",
    baseCountry: artist.base_country ?? "",
    isClaimed: artist.is_claimed,
    isVerified: artist.is_verified,
    contactType: artist.contact_type as ArtistProfile["contactType"],
    contactValue: artist.contact_value ?? "",
    tags,
    portfolioItems,
    upcomingSchedules,
  };
}

// ── 검색 ────────────────────────────────────────────────────

export interface SearchParams {
  tagSlugs?: string[];
  city?: string;
  startDate?: string;
  endDate?: string;
  type?: "all" | "guest" | "based";
}

export interface SearchResult {
  artistId: string;
  displayName: string;
  instagramHandle: string | null;
  isVerified: boolean;
  isClaimed: boolean;
  baseCity: string | null;
  baseCountry: string | null;
  contactType: string;
  contactValue: string | null;
  matchedTags: number;
  totalTags: number;
  priority: number;
  nextSchedule: GuestSchedule | null;
  tags: Tag[];
}

export async function searchArtists(
  params: SearchParams
): Promise<SearchResult[]> {
  const supabase = await getSupabaseServerClient();

  const { data, error } = await (supabase as any).rpc("search_artists", {
    p_tag_slugs:  params.tagSlugs  ?? [],
    p_city:       params.city      ?? null,
    p_start_date: params.startDate ?? null,
    p_end_date:   params.endDate   ?? null,
    p_type:       params.type      ?? "all",
  });

  if (error || !data) return [];

  return data.map((row: any) => {
    const rawTags = Array.isArray(row.tags) ? row.tags : [];
    const tags: Tag[] = rawTags.map((t: { id: string; name: string; slug: string; group: string }) =>
      toTag(t)
    );

    const rawSched = row.next_schedule as {
      id: string; city: string; country: string;
      city_lat: number; city_lng: number; region: string;
      start_date: string; end_date: string;
      note?: string; contact_type: string; contact_value?: string;
    } | null;

    return {
      artistId: row.artist_id,
      displayName: row.display_name,
      instagramHandle: row.instagram_handle,
      isVerified: row.is_verified,
      isClaimed: row.is_claimed,
      baseCity: row.base_city,
      baseCountry: row.base_country,
      contactType: row.contact_type,
      contactValue: row.contact_value,
      matchedTags: Number(row.matched_tags),
      totalTags: Number(row.total_tags),
      priority: row.priority,
      nextSchedule: rawSched ? toSchedule(rawSched) : null,
      tags,
    };
  });
}

// ── 도시 페이지 ─────────────────────────────────────────────

export async function getCityArtists(city: string) {
  const guests = await searchArtists({ city, type: "guest" });
  const based = await searchArtists({ city, type: "based" });
  return { guests, based };
}

// ── 지도 핀 ────────────────────────────────────────────────

export interface CityPin {
  city: string;
  country: string;
  cityLat: number;
  cityLng: number;
  region: "asia" | "europe" | "americas" | "other";
  upcomingCount: number;
}

export async function getCityPins(
  region?: "asia" | "europe" | "americas" | "other"
): Promise<CityPin[]> {
  const supabase = await getSupabaseServerClient();

  let query = supabase
    .from("city_pin_summary")
    .select("city, country, city_lat, city_lng, region, upcoming_count")
    .gt("upcoming_count", 0);

  if (region) {
    query = query.eq("region", region);
  }

  const { data, error } = await query.order("upcoming_count", {
    ascending: false,
  });

  if (error || !data) return [];

  return (data as any[]).map((row: any) => ({
    city: row.city,
    country: row.country,
    cityLat: row.city_lat,
    cityLng: row.city_lng,
    region: row.region as CityPin["region"],
    upcomingCount: row.upcoming_count,
  }));
}

// ── 태그 전체 목록 ──────────────────────────────────────────

export async function getAllTags(): Promise<Tag[]> {
  const supabase = await getSupabaseServerClient();

  const { data, error } = await supabase
    .from("tags")
    .select("id, name, slug, group_type")
    .order("group_type")
    .order("name");

  if (error || !data) return [];

  return (data as any[]).map((t: any) => toTag({ ...t, group: t.group_type }));
}
