import type { Metadata } from "next";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { PageContainer } from "@/components/layout/PageContainer";
import { TopBar } from "@/components/layout/TopBar";
import { CalendarClient } from "./CalendarClient";
import { getFollowingCalendar, getCityCalendarData } from "@/lib/queries/calendar";

export const metadata: Metadata = { title: "캘린더" };

export default async function CalendarPage() {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  // role 조회
  let role: "customer" | "artist" | "admin" | null = null;
  let artistHandle: string | null = null;
  let baseCity: string | null = null;

  if (user) {
    const { data: userRow } = await supabase
      .from("users")
      .select("role, base_city")
      .eq("id", user.id)
      .single();

    role     = (userRow?.role ?? "customer") as "customer" | "artist" | "admin";
    baseCity = userRow?.base_city ?? null;

    // Artist: 본인 handle 조회 (Guest Work 등록 CTA 링크용)
    if (role === "artist" || role === "admin") {
      const { data: artistRow } = await supabase
        .from("artist_profiles")
        .select("instagram_handle")
        .eq("user_id", user.id)
        .maybeSingle();
      artistHandle = (artistRow as { instagram_handle: string | null } | null)
        ?.instagram_handle ?? null;
    }
  }

  // cities 조회
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

  // Customer: 이번 달 팔로우 일정 조회
  const now = new Date();
  const currentYear  = now.getFullYear();
  const currentMonth = now.getMonth();

  let followingSchedules: Awaited<ReturnType<typeof getFollowingCalendar>> = [];
  if (user && role !== "artist" && role !== "admin") {
    followingSchedules = await getFollowingCalendar(user.id, currentYear, currentMonth);
  }

  // Artist: 초기 도시(base_city 또는 cities[0]) 데이터 조회
  let initialCityData: Awaited<ReturnType<typeof getCityCalendarData>> | null = null;
  if (role === "artist" || role === "admin") {
    const initialCity = baseCity ?? cities[0]?.name ?? null;
    if (initialCity) {
      initialCityData = await getCityCalendarData(initialCity, user?.id);
    }
  }

  return (
    <PageContainer>
      <TopBar title="캘린더" />
      <CalendarClient
        role={role}
        cities={cities}
        artistHandle={artistHandle}
        followingSchedules={followingSchedules}
        initialCityData={initialCityData}
        initialYear={currentYear}
        initialMonth={currentMonth}
      />
    </PageContainer>
  );
}
