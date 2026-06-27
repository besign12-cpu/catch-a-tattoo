import type { Metadata } from "next";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { PageContainer } from "@/components/layout/PageContainer";
import { CalendarClient } from "./CalendarClient";
import { getFollowingCalendar, getCityCalendarData, getCitySchedules } from "@/lib/queries/calendar";

export const metadata: Metadata = { title: "캘린더" };

export default async function CalendarPage() {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  // role / base_city / artistHandle / artistBaseCity 조회
  let role: "customer" | "artist" | "admin" | null = null;
  let artistHandle: string | null = null;
  let baseCity: string | null = null;        // users.base_city
  let artistBaseCity: string | null = null;  // artist_profiles.base_city

  if (user) {
    const { data: userRow } = await supabase
      .from("users")
      .select("role, base_city")
      .eq("id", user.id)
      .single();

    role     = (userRow?.role ?? "customer") as "customer" | "artist" | "admin";
    baseCity = userRow?.base_city ?? null;

    // Artist: handle + base_city 함께 조회
    if (role === "artist" || role === "admin") {
      const { data: artistRow } = await supabase
        .from("artist_profiles")
        .select("instagram_handle, base_city")
        .eq("user_id", user.id)
        .maybeSingle();

      const ar = artistRow as {
        instagram_handle: string | null;
        base_city: string | null;
      } | null;

      artistHandle   = ar?.instagram_handle ?? null;
      artistBaseCity = ar?.base_city ?? null;
    }
  }

  // cities 마스터 조회
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
      id:          c.id,
      name:        c.name,
      country:     c.country,
      countryName: c.country_name,
      region:      c.region,
    })
  );

  // ── 초기 도시 결정 ────────────────────────────────────────────
  // cities 마스터에서 name 정확 매칭 → fallback 순서 준수
  // Amsterdam 같은 cities[0] 기본 선택 방지

  const DEFAULT_CITY_NAME = "Seoul";

  function findCity(name: string | null) {
    if (!name) return null;
    return cities.find(c => c.name === name) ?? null;
  }

  // Customer: users.base_city → Seoul(default) → null (cities[0] fallback 금지)
  const customerInitialCity =
    findCity(baseCity) ??
    findCity(DEFAULT_CITY_NAME) ??
    null;  // base_city도 없고 Seoul도 없는 경우만 null

  // Artist: artist_profiles.base_city → users.base_city → Seoul → null
  const artistInitialCity =
    findCity(artistBaseCity) ??
    findCity(baseCity) ??
    findCity(DEFAULT_CITY_NAME) ??
    null;

  // ── 데이터 조회 ───────────────────────────────────────────────

  const now          = new Date();
  const currentYear  = now.getFullYear();
  const currentMonth = now.getMonth();

  // Customer + Artist 모두 팔로우 일정 조회
  // (Artist = Customer 기능 전체 포함)
  let followingSchedules: Awaited<ReturnType<typeof getFollowingCalendar>> = [];
  let initialCitySchedules: Awaited<ReturnType<typeof getCitySchedules>> = [];

  if (user) {
    followingSchedules = await getFollowingCalendar(user.id, currentYear, currentMonth);
    if (customerInitialCity) {
      initialCitySchedules = await getCitySchedules(
        customerInitialCity.name, currentYear, currentMonth
      );
    }
  }

  // Artist: 초기 도시 KPI 데이터
  let initialCityData: Awaited<ReturnType<typeof getCityCalendarData>> | null = null;
  if ((role === "artist" || role === "admin") && artistInitialCity) {
    initialCityData = await getCityCalendarData(artistInitialCity.name, user?.id);
  }

  return (
    <PageContainer>
      <CalendarClient
        role={role}
        cities={cities}
        artistHandle={artistHandle}
        followingSchedules={followingSchedules}
        initialCitySchedules={initialCitySchedules}
        initialCustomerCity={customerInitialCity}
        initialArtistCity={artistInitialCity}
        initialCityData={initialCityData}
        initialYear={currentYear}
        initialMonth={currentMonth}
      />
    </PageContainer>
  );
}
