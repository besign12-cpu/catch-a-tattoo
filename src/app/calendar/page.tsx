import type { Metadata } from "next";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { PageContainer } from "@/components/layout/PageContainer";
import { TopBar } from "@/components/layout/TopBar";
import { CalendarClient } from "./CalendarClient";

export const metadata: Metadata = {
  title: "캘린더",
};

// ── 메인 페이지 ────────────────────────────────────────────
// 비로그인: role=null → CustomerCalendar 표시 (팔로우 일정 영역만 로그인 유도)
// Customer:  role="customer" → CustomerCalendar
// Artist:    role="artist"|"admin" → ArtistCalendar

export default async function CalendarPage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 로그인 여부 확인 + role 조회
  let role: "customer" | "artist" | "admin" | null = null;
  let artistHandle: string | null = null;

  if (user) {
    const { data: userRow } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();
    role = (userRow?.role ?? "customer") as "customer" | "artist" | "admin";

    // Artist/Admin이면 instagram_handle 조회 (Guest Work 등록 링크용)
    if (role === "artist" || role === "admin") {
      const { data: artistRow } = await supabase
        .from("artist_profiles")
        .select("instagram_handle")
        .eq("user_id", user.id)
        .maybeSingle();
      artistHandle = artistRow?.instagram_handle ?? null;
    }
  }
  // role=null: 비로그인 → CustomerCalendar(달력은 보이고, 팔로우 영역만 로그인 유도)

  // Artist View용 cities 조회 (role과 무관하게 조회 — 비로그인도 포함)
  const { data: citiesData } = await supabase
    .from("cities")
    .select("id, name, country, country_name, region")
    .eq("is_approved", true)
    .order("name", { ascending: true });

  const cities = (citiesData ?? []).map(
    (c: {
      id: string;
      name: string;
      country: string;
      country_name: string;
      region: "asia" | "europe" | "americas" | "other";
    }) => ({
      id: c.id,
      name: c.name,
      country: c.country,
      countryName: c.country_name,
      region: c.region,
    })
  );

  return (
    <PageContainer>
      <TopBar title="캘린더" />
      <CalendarClient role={role} cities={cities} artistHandle={artistHandle} />
    </PageContainer>
  );
}
